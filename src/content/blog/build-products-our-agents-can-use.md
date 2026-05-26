---
title: 'Build Products Our Agents Can Use'
date: '2026-05-26'
author: 'Kris Hagel'
tags: ['Information Sharing']
image: '/images/blogs/agents-blog-01-chatbot-trapped.png'
description: 'The closed system is now a liability. A call to EdTech vendors, districts, and standards bodies to make products safe for district-owned agents to use, before districts build the replacements themselves.'
---

**The closed system is now a liability. If EdTech vendors cannot rethink their infrastructure, districts will build the replacements ourselves.**

A few weeks ago, [K-12 Dive ran a piece](https://www.k12dive.com/news/vibe-coding-helped-a-washington-district-save-250k-in-ed-tech-costs/816993/) on Peninsula School District's use of AI-assisted development to build our own internal tools and sunset roughly $250,000 worth of software subscriptions. The response from the field has been bigger than I expected. Calls from other districts, questions from vendors, a lot of curiosity about whether this is a one-off or the start of something.

It is the start of something. So this is the follow-up the article deserves.

The $250,000 figure is not the headline. The headline is the shift in posture that produced it. We stopped accepting that the only way to get work done across our systems was to buy another product with a polished UI. We started asking a different question: _can our own people, working with our own AI tools, do this safely and well?_ For a growing number of workflows, the answer is yes. And once a district answers yes once, the procurement calculus changes for everything else on the contract list.

That is the part of the story EdTech vendors should be paying attention to. Not the dollars saved. The precedent set.

## The Story EdTech Is Telling Itself

![A walled medieval garden with one isolated product, beside an open colonnaded square where many products and people move freely](/images/blogs/agents-blog-06-garden-vs-square.png)

There is a story EdTech is telling itself right now, and it is going to age badly.

The story goes: AI is the future, our product needs AI, therefore we should ship a chatbot. Maybe an "assistant" sidebar. Maybe an "ask anything" search box. Sprinkle in just enough AI to satisfy investors, funders, and the board slide deck, and call it the AI strategy.

That is not a strategy. That is theater.

I am not going to claim to know exactly where this lands. But from where I sit, what I am seeing in our own work, in conversations with peers, and in the trajectory of the technology itself, the direction is becoming hard to miss: K-12 is moving toward **district-owned agents that coordinate work across the entire ecosystem.** Those agents are increasingly built or bought by the district, governed by the district, and bound by district identity, district permissions, and district data agreements. And they will need to talk to your product on behalf of our staff.

If your product cannot participate in that ecosystem, your AI features are a distraction. Worse, they are a tax. Districts are paying for AI capabilities our own agents will eclipse within a year, while the part of your product that actually matters (the data, the workflows, the records of what happens in our schools) stays locked behind a human-only interface.

So here is the line I want every EdTech vendor reading this to internalize:

> **Stop building another chatbot inside your application. Start building an application that is safe for our agents to use.**

That is the entire shift. Everything that follows is about why it matters, what "agent-ready" actually means, and what districts, standards groups, nonprofits, and vendors need to start doing differently right now.

## The Threat Is Real. We Have the Receipts.

I want vendors to hear this part clearly, because the K-12 Dive article was not a victory lap. It was a data point.

Several of our staff, none of them with a computer science background, are now building functional applications using Claude Code, running on our private [AI Studio](https://psd401.ai/aistudio) with data privacy agreements that actually protect our students and staff. We did not do this because we wanted to become a software company. We did it because we looked critically at what we were paying for and realized a lot of it was not as complex as the price tag suggested. A lot of it was actively blocking us from moving faster.

We are not going to stop. The $250,000 is the first wave. We have a backlog of other tools on the contract list that we are now evaluating against a much harder question than we used to ask.

The old question was: _does this product do what we need?_

The new question is: _can our agent reach into this product safely, or is this something we should just build?_

That second question is starting to reshape how we look at every contract. The products holding up best in our portfolio right now are not the ones with the slickest UI or the trendiest embedded AI. They are the ones our agents can talk to. From what I am seeing, everything else is on a clock.

The vendors who understand that are going to be the partners we build the next decade with. The ones who don't are going to be replaced. Sometimes by a competitor, sometimes by a tool a district team builds in an afternoon.

This is not a threat I am making to be provocative. It is a description of work that is already underway, in Peninsula and in a growing number of other districts. The cost of building has collapsed. The cost of staying locked into a closed system has not.

## K-12 Work Is Inherently Cross-System

![Isometric cutaway of a school district building with an agent layer at the top connecting wires down to floors labeled SIS, LMS, HR, Finance, Transportation, IEP](/images/blogs/agents-blog-02-district-cutaway.png)

This is the part I do not think most vendors fully appreciate. **No single product owns enough of a K-12 workflow to matter on its own.**

A real district workflow might require information from:

- SIS
- LMS
- assessment platform
- MTSS / intervention system
- IEP / special education system
- HR
- finance
- transportation
- food service
- device management
- help desk
- Google / Microsoft
- communications platform
- cybersecurity tools
- curriculum tools
- data warehouse

No vendor assistant is going to solve that. Not yours. Not the SIS vendor's. Not the LMS vendor's. Not even the biggest platform players. The district agent, ours or one we buy, has to coordinate across all of those systems.

![Diptych: a cluttered desk piled with CSV printouts and folders on the left, the same desk clean with a single laptop and a one-page briefing on the right](/images/blogs/agents-blog-04-desk-diptych.png)

Consider a concrete example. A principal says to her agent:

> "Prepare a briefing for tomorrow's student support meeting on the eight students we're discussing."

To do that well, the agent may need to gather:

- attendance
- grades
- behavior incidents
- intervention history
- assessment trajectory
- teacher notes
- IEP / 504 status
- parent communication log
- transportation constraints
- device or help desk issues
- prior meeting notes and decisions

If each of those systems is closed, the agent cannot help, and the principal spends another two hours pulling reports manually before a meeting where the actual goal is to make a decision about a kid. If each of those systems is agent-ready, the agent prepares the human team to do the human work better.

That is the bar. Help the humans do the human work better. A vendor chatbot that can only see its own slice of data cannot meet that bar, by definition.

## The EdTech Partner Litmus Test

![Editorial cartoon of a vendor sales rep holding up a phone with a chatbot bubble, across a conference table from a district CIO holding up a clipboard listing API, Webhooks, Audit log, Sandbox](/images/blogs/agents-blog-08-cartoon.png)

If you are a vendor and you want to know whether your product is ready for the next era, here is the simplest possible test:

> If a district-approved agent is given a clearly scoped task, can your system safely participate?

Concretely, that decomposes into questions like:

- Can our agent **retrieve** the right records on behalf of a user?
- Can it **respect that user's permissions**, not a god-mode service account?
- Can it **explain** what it just did, in human-readable terms?
- Can it **stage a change** for human approval before committing it?
- Can it **write back** when approved, with the right user attribution?
- Can it **leave an audit trail** we can review and export?
- Can it **be tested in a sandbox** before touching production?
- Can access be **revoked** in seconds when staff change roles?
- Can your system **notify our agent** when something important changes, without us polling you to death?

If most of those answers are "no" or "kind of, with a CSV export," the product is not ready for the next era. And no amount of AI marketing copy is going to change that.

## The Agent-Ready EdTech Rubric

![Hand-drawn editorial staircase with five steps labeled Level 0 Closed through Level 4 Ecosystem-Native, with small product figures climbing at different positions](/images/blogs/agents-blog-03-rubric-staircase.png)

Districts need a shared vocabulary when we evaluate products. Standards bodies need something to formalize. Here is a starting point. Treat this as a draft the community should sharpen.

### Level 0: Closed System

- UI-only.
- Manual exports at best.
- No meaningful API.
- No automation support.
- "We're working on AI features" usually means a chatbot is coming.

**Verdict:** Buy at your peril. This is a one-year product in a five-year contract.

### Level 1: Data-Accessible

- APIs or scheduled exports exist.
- Agents can read some data, usually in batches.
- Limited or awkward write capability.
- Permissions are coarse and auditing is weak.

**Verdict:** Tolerable for read-only analytics. Not safe for action-taking agents.

### Level 2: Workflow-Accessible

- Scoped APIs cover read and write for major objects.
- Approval workflows exist or can be modeled.
- Audit logs are real and exportable.
- A sandbox or test environment exists.

**Verdict:** This is the floor for any new K-12 procurement starting now.

### Level 3: Agent-Ready

- API and tool coverage matches the major actions a user can take in the UI.
- Fine-grained delegated permissions (OAuth scopes, SCIM, per-action authorization).
- Strong, queryable audit trails.
- Webhooks and event streams for important state changes.
- MCP servers, OpenAPI specs, and machine-readable tool descriptions.
- Dry-run / preview and rollback for destructive actions.
- Clear data governance and DPA terms that cover agent use.

**Verdict:** This is where every serious K-12 product needs to be within the next year or so.

### Level 4: Ecosystem-Native

- Designed from the ground up for district-owned agents.
- Plays cleanly across identity, data, workflow, and observability layers.
- Supports multi-agent workflows and inter-agent coordination patterns.
- Publishes safe action patterns and reference integrations.
- Integrates with district AI governance, monitoring, and policy enforcement.

**Verdict:** This is the bar that defines the next generation of EdTech leaders.

If you are a vendor reading this and you cannot honestly place your product at Level 2 or above today, you have a roadmap problem, not a marketing problem. Please do not spend the next quarter shipping a chatbot. Spend it shipping an API, a webhook, an audit log, and a sandbox.

## What I Want Vendors To Do, Specifically

This is the Monday-morning version. And before the bullets, the meta-point: **rethink the infrastructure, not the marketing.** A chatbot bolted onto a closed system is not an AI strategy. It is a feature your funders will reward for one quarter and your customers will route around for the next decade. The vendors who win this era are the ones who treat agent-readiness as an architectural commitment, not a launch announcement.

- **Publish your agent-readiness level honestly.** Self-assess against the rubric above, or one the community converges on. Put it in your sales collateral. If you are at Level 1, say so, and publish the roadmap to Level 3.
- **Stop hiding APIs behind enterprise tiers.** If your API access costs more than the product itself, you are telling us you do not want to be part of our ecosystem. We hear you.
- **Ship MCP servers and OpenAPI specs.** Make it trivial for our agents to discover what your product can do. The vendors who do this first will win the next five years of procurement decisions.
- **Build delegated permissions, not service accounts.** Our agents should act _as_ a specific user, with that user's permissions, leaving that user's name in the audit log. Service-account integrations are how data breaches happen.

![Two padlocks side by side: a heavy industrial padlock labeled Service Account, beside an open padlock with a name tag reading Maria, Principal](/images/blogs/agents-blog-07-padlocks.png)

- **Give us a sandbox.** A real one. With representative data. So we can test agent workflows without risking production.
- **Treat your DPA language as living.** Agents are a new category of access. Update your data privacy agreements proactively, not reactively when a district's general counsel asks.
- **Stop building chatbots inside your product.** We do not need another sidebar assistant that only knows about your data. We need your data to be safely reachable by _our_ assistant, which knows about everything.

## What I Want Districts To Do

![Constellation of nodes representing district systems with bright orchestration lines converging to a single central node bearing a district crest](/images/blogs/agents-blog-05-constellation.png)

If you are a fellow K-12 CIO, superintendent, CTO, or director of technology, this is on us too. Vendors will not change unless we change what we buy and how we buy it.

- **Add agent-readiness to every RFP, renewal, and pilot evaluation.** Make it a scored category, not a footnote.
- **Stop paying premiums for embedded AI features.** Pay for capability and access. Let your own AI layer do the assistant work.
- **Demand DPAs that explicitly cover agent access.** If your legal team has not updated language for agent-mediated access, do that this quarter.
- **Build or buy a district agent layer you actually own.** Whether that is a private [AI Studio](https://psd401.ai/aistudio), a homegrown stack, or a partner that respects your governance, own the orchestration layer. Do not rent it.
- **Invest in your people.** Our administrators are building tools because we gave them the platform and the permission to. Your staff can do the same. This is not just an IT story; it is a workforce transformation story.
- **Be willing to walk away.** A product that cannot participate in your ecosystem is a product you will regret in 24 months. Short-term convenience is not worth long-term lock-in to a closed system.

The CIO role itself is shifting. We used to be **systems integrators**. We are becoming **agent ecosystem architects**. That means owning identity, permissioning, data governance, interoperability, auditability, human-in-the-loop approval, procurement standards, staff training, workflow redesign, and vendor accountability, all as a single coherent strategy.

**The agent is not the strategy. The ecosystem is the strategy.**

## What Standards Bodies And Nonprofits Need To Do

![Two buildings labeled District and Vendor with a partially-built suspension bridge between them, scaffolding sections labeled MCP, OpenAPI, OAuth, Webhooks](/images/blogs/agents-blog-09-unfinished-bridge.png)

This is the part of the conversation that is missing, and it is the part that matters most for the field at scale.

CoSN, ISTE, SETDA, AASA, A4L, 1EdTech, CASE, Project Unicorn, state CIO associations: you have an opportunity right now to define what "agent-ready EdTech" means before the market defines it for you, badly.

- **Publish an agent-readiness framework.** Take the rubric above, or one better. Make it the shared language districts can put in RFPs.
- **Certify products against it.** Project Unicorn already does this for interoperability. Extend it. Make agent-readiness a visible badge procurement teams can use.
- **Update existing interoperability standards for the agent era.** OneRoster, Ed-Fi, and LTI Advantage were built for system-to-system integration, not agent-to-system. They need extensions for tool descriptions, delegated permissions, audit semantics, and event streams.
- **Convene the vendors.** Get the major SIS, LMS, assessment, and MTSS vendors in a room and make them commit to an agent-readiness roadmap with public milestones.
- **Build model DPA language.** Districts should not each be inventing this on their own. Give us a starting template that addresses agent-mediated access, delegated authentication, and audit expectations.

This is the work that will determine whether the next decade of EdTech is genuinely transformative or just the same closed systems wearing AI-shaped hats.

## The Ask, Distilled

![A symphony orchestra viewed from behind the conductor, each music stand labeled with a different district system category like SIS, LMS, HR, Finance, Transportation, IEP](/images/blogs/agents-blog-10-orchestra.png)

We appear to be entering a moment where districts can build or buy enterprise agents that meaningfully assist with leadership, operations, teaching, support, and communication. From everything I am seeing, those agents are only going to be as useful as the ecosystem they can safely reach into.

The vendors who understand this and act on it will be the partners we build the next decade with. The ones who keep sprinkling AI into walled gardens (a chatbot here, an "ask anything" box there, just enough to put on the funder slide) will be the ones we replace. Sometimes with a competitor. Increasingly, with something a district team builds in an afternoon.

I would much rather build the future _with_ our partners than around them. But the cost of building has collapsed, and the willingness to wait for vendors to catch up has collapsed with it. The choice is theirs. The clock is running. And the receipts are already in the K-12 Dive article.

So:

> **Vendors:** Stop building chatbots inside your product. Make your product safe for our agents to use. Publish your level. Show us the roadmap.
>
> **Districts:** Stop paying for embedded AI. Start paying for access, governance, and interoperability. Put agent-readiness in your RFPs this quarter.
>
> **Standards bodies and nonprofits:** Define what agent-ready means before the market defines it badly. Certify it. Convene the vendors. Give us shared language.

The agent is not the strategy. The ecosystem is the strategy. Let's go build it, together or not at all.

---

_Kris Hagel is the Chief Information Officer at Peninsula School District in Gig Harbor, Washington._

_A note on AI: the ideas, arguments, and positions in this piece are my own. I used AI to assist with grammatical editing and to generate the illustrations throughout. The thinking is mine; the polish and the artwork had help._
