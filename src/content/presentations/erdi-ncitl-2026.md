---
type: presentation
title: Agents do the work
description: Kris Hagel and Ryan Gravette explain what an AI agent is, how Peninsula runs agents for staff and IT, and what districts should ask of vendors.
resource: /presentations/erdi-ncitl-2026
date: '2026-10-30'
tags:
  - Conference Session
  - ERDI NCITL
presenters:
  - Kris Hagel
  - Ryan Gravette
audience: ERDI NCITL
format: Conference Session
thumbnail: /images/thumbnails/erdi-ncitl-2026.png
slides: https://docs.google.com/presentation/d/15wubM9S2i4yHR4DGlZl_EkgmKPxn8iuXbq_sPAjrWN8/embed
sources:
  - resource: https://docs.google.com/presentation/d/15wubM9S2i4yHR4DGlZl_EkgmKPxn8iuXbq_sPAjrWN8/embed
    id: slides
    title: Slide deck
---

**Agents do the work**

Kris Hagel, Chief Information Officer at Peninsula School District, and Ryan Gravette, Chief Technology Officer at Boise School District, give this session at the ERDI NCITL Fall Thought Leader Symposium in Chicago on October 30, 2026. Subtitled "What district technology leaders need to understand, build and govern now," it gives district technology leaders a plain definition of an AI agent, shows how Peninsula runs agents for staff and in its IT department, sets out what districts should ask of vendors, and closes with an analysis an agent ran on the district's own laptop data.

**Key Takeaways:**

- **The field is still catching up:** The talk opens with CoSN's State of EdTech 2026 survey of 607 leaders, in which 25% of K-12 technology leaders had never heard the term "agentic AI" and 36% could define it.
- **An agent works a loop:** A chatbot, including a custom GPT, Gem or Copilot agent, answers one turn and waits. An agent takes a goal, plans a step, uses a tool, reads the result and checks whether it is done, right and allowed, repeating until the job is finished or it needs a person. The session's one-sentence definition: "An agent takes a goal, plans the steps, and uses tools in our systems to finish the work, inside permissions we set."
- **Five parts, and the harness is new:** Every agent has a model, a harness that runs the loop, context, tools and skills, all inside permissions. MCP is one standard way to connect agents to systems, so each system publishes its tools once. Google's Classroom MCP server, for example, offers 16 tools, two of which return class rosters and guardian contacts, which is why MCP decisions are permission decisions.
- **Agents should act as the person:** At Peninsula, a principal's agent queries the data warehouse as her and gets only her school's rows. The talk contrasts that delegated access with one powerful shared account whose actions log as "the system."
- **Set autonomy per task, and pick two:** Tasks move through four levels, from suggesting to acting and reporting, and most should start at drafting for a person to send. Messages to families, student records, discipline and HR decisions stay with people. The safety check: an agent should not combine private data, untrusted content and outside action without a person's approval.
- **One district's pattern:** More than 275 Peninsula staff use a [PSD AI Agent](/software/psd-ai-agents.md) by choice. Each agent has its own account, lives in Google Chat, inherits its owner's permissions, never holds reusable credentials, keeps memory in plain files, starts with 30+ skills and publishes only to a sandbox. Examples included the superintendent's 5 a.m. morning brief, a finance reconciliation of the county report against the trial balance, county reclassification forms, growth by quartile for principals, a disputed transportation route, and a CTE class simulation built in 30 minutes.
- **Agents in IT, under rules:** Peninsula is moving its infrastructure into code that coding agents write and people review, with AI review on every pull request, security scans on every build and an agent keeping the wiki current. Its ground rules: every change reviewed, security first, containers on district cloud, fake data first, automatic error detection, and people merge. The slide credits this approach, with four engineers and seven people building with Claude Code, with retiring more than $300K a year in subscriptions.
- **What the laptop saw:** Asked what YouTube use on district laptops looked like this fall, a coding agent worked on its own for six hours on the web filter logs from August 29 to October 22, 2026: 312,991 YouTube opens by 5,599 students. Teacher-directed viewing was 11% of school-hours opens and nearly all educational; 65% of what students chose on their own during school hours was noneducational; and 358 students opened YouTube between midnight and 5 a.m. before a school day. Student-level data stayed on a district machine, only video IDs, titles and categories went to the models, search text never did, and groups under 10 students were left out of every total.

**Actionable Insights:**

- **Agree on what "agent" means:** Use the one-sentence definition with your cabinet.
- **Run the pick-two check:** Before approving any agent, from a vendor or a staff member, check whether it combines private data, untrusted content and outside action.
- **Ask every vendor nine questions:** Can an approved agent, given a scoped task, safely retrieve the records it needs, act with the user's own permissions, explain what it did, stage changes for approval, write back credited to the user, leave an exportable audit trail, work in a sandbox first, lose its access in seconds, and hear about changes as they happen? The talk's draft agent-ready scale runs from level 0 (closed) to level 4 (ecosystem-native), with level 2 as the floor for buying. It draws on the post [Build Products Our Agents Can Use](/writing/build-products-our-agents-can-use.md).
- **Treat the ecosystem as the strategy:** Score agent readiness in every RFP and renewal, pay for access and interoperability rather than a built-in chatbot, require data agreements that cover agent access, and own the layer where your agents run.
- **Find one story in your own data:** Let an agent draft it inside your rules, as Peninsula did with its laptop data.

**Looking Ahead:**

The laptop analysis ends with five questions Peninsula will work on: how grades 6 to 8 structure laptop time, what the schools with the most teacher-directed viewing do that others could borrow, whether a district laptop should play YouTube at 3 a.m. before a school day, which educational videos the filter should let through, and how to reach the families of the students who watch the most at home. The presenters invite attendees to the Agentic Builders Committee, a group of K-12 technology leaders who meet monthly to share what they are building and what broke, and point to three FETC 2027 sessions on agents.
