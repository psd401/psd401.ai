/**
 * Production driver: DynamoDB for the list, SES for the confirmation email.
 *
 * Credentials come from the default AWS provider chain — on Amplify Hosting,
 * the app's IAM compute role; locally, your AWS profile. No keys are stored in
 * the app. The table and the policy the compute role needs are defined in
 * infra/field-notes.yaml; setup is in docs/field-notes.md.
 */
import { DynamoDBClient, ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { GetAccountCommand, SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import type { ConfirmationMailer, Subscriber, SubscriberStore } from './core';
import type { IssueMailer, IssueStore, OutgoingMessage } from './send';
import { confirmationEmail } from './email';

export const SID_INDEX = 'bySid';

export class DynamoStore implements SubscriberStore, IssueStore {
  private db: DynamoDBDocumentClient;

  constructor(
    private table: string,
    region: string
  ) {
    this.db = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  async getByEmail(email: string) {
    const out = await this.db.send(
      new GetCommand({ TableName: this.table, Key: { email }, ConsistentRead: true })
    );
    return (out.Item as Subscriber | undefined) ?? null;
  }

  async getBySid(sid: string) {
    // GSI reads are eventually consistent. A confirm click normally lands
    // seconds after the item was written, well past propagation.
    const out = await this.db.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: SID_INDEX,
        KeyConditionExpression: 'sid = :sid',
        ExpressionAttributeValues: { ':sid': sid },
        Limit: 1,
      })
    );
    return (out.Items?.[0] as Subscriber | undefined) ?? null;
  }

  async put(subscriber: Subscriber) {
    await this.db.send(new PutCommand({ TableName: this.table, Item: subscriber }));
  }

  async markConfirmed(email: string, confirmedAt: string) {
    try {
      await this.db.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { email },
          UpdateExpression:
            'SET #status = :confirmed, confirmedAt = :at REMOVE confirmHash, expiresAt, lastSentAt',
          ConditionExpression: '#status = :pending',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':confirmed': 'confirmed',
            ':pending': 'pending',
            ':at': confirmedAt,
          },
        })
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  }

  async remove(email: string) {
    await this.db.send(new DeleteCommand({ TableName: this.table, Key: { email } }));
  }

  /*
   * The two methods below are used only by the issue sender
   * (scripts/field-notes-send.ts), which runs with an operator's credentials.
   * The site's own IAM policy does not grant Scan.
   */

  async *listConfirmed() {
    let start: Record<string, unknown> | undefined;
    do {
      // Strongly consistent, so a subscriber who confirmed a moment ago is
      // included and one who just unsubscribed is not.
      const page = await this.db.send(
        new ScanCommand({
          TableName: this.table,
          FilterExpression: '#status = :confirmed',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':confirmed': 'confirmed' },
          ConsistentRead: true,
          ExclusiveStartKey: start,
        })
      );
      for (const item of page.Items ?? []) yield item as Subscriber;
      start = page.LastEvaluatedKey;
    } while (start);
  }

  async markIssueSent(email: string, issueId: string, at: string) {
    try {
      await this.db.send(
        new UpdateCommand({
          TableName: this.table,
          Key: { email },
          UpdateExpression: 'ADD issuesSent :issue SET lastIssueAt = :at',
          // Without this, updating a record deleted mid-run by an unsubscribe
          // would silently re-create it.
          ConditionExpression: 'attribute_exists(email) AND #status = :confirmed',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: {
            ':issue': new Set([issueId]),
            ':at': at,
            ':confirmed': 'confirmed',
          },
        })
      );
      return true;
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return false;
      throw error;
    }
  }
}

export class SesMailer implements ConfirmationMailer, IssueMailer {
  private ses: SESv2Client;

  constructor(
    private from: string,
    region: string
  ) {
    this.ses = new SESv2Client({ region });
  }

  async sendConfirmation(to: string, url: string) {
    const { subject, text, html } = confirmationEmail(url);
    await this.ses.send(
      new SendEmailCommand({
        FromEmailAddress: this.from,
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Text: { Data: text, Charset: 'UTF-8' },
              Html: { Data: html, Charset: 'UTF-8' },
            },
          },
        },
      })
    );
  }

  async sendIssue(to: string, message: OutgoingMessage) {
    await withThrottleRetry(() =>
      this.ses.send(
        new SendEmailCommand({
          FromEmailAddress: this.from,
          Destination: { ToAddresses: [to] },
          Content: {
            Simple: {
              Subject: { Data: message.subject, Charset: 'UTF-8' },
              Body: {
                Text: { Data: message.text, Charset: 'UTF-8' },
                Html: { Data: message.html, Charset: 'UTF-8' },
              },
              Headers: message.headers,
            },
          },
        })
      )
    );
  }

  /** The account's sending ceiling, in messages per second. */
  async maxSendRate(): Promise<number> {
    const account = await this.ses.send(new GetAccountCommand({}));
    return account.SendQuota?.MaxSendRate ?? 1;
  }
}

/** SES throttles by rate; back off and retry a few times before giving up. */
async function withThrottleRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      const throttled = name === 'TooManyRequestsException' || name === 'ThrottlingException';
      if (!throttled || i >= attempts) throw error;
      await new Promise(r => setTimeout(r, 500 * 2 ** i));
    }
  }
}
