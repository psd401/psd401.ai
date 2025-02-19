---
title: 'AI as a Data Intern: Smart, Fast, & Needs Oversight'
date: '2025-02-19'
author: 'James Cantonwine'
tags: ['AI in Action']
image: '/images/blogs/ai-data-intern.png'
description: 'Discover how to harness AI as your tireless data analyst intern - smart and fast, but keep an eye on their work!'
---

When it comes to crunching numbers, Large Language Models (LLMs) can be hit-or-miss. If you’ve ever asked your favorite generative AI to perform a calculation only to receive a suspiciously incorrect answer, you’re not alone.

Here’s the underappreciated twist: ChatGPT-4o, Claude Sonnet, and other modern LLMs can write and execute code to then perform accurate calculations. You can use that ability to get consistent and reliable analytical outputs. If you’re not sure whether the LLM is using code to provide its output, there are options to review the code generated. Even if you don’t code yourself, specifying that the model should provide you with code is a helpful way to make sure that it uses code rather than “predicting” an answer. Essentially, AI can act as your own personal data analyst intern, allowing you to offload certain tasks while you focus on higher-level problem-solving.

---

## Why Use AI?

### 1\. AI as a Thought Partner

When you’re exploring new data sets or testing hypotheses, AI can act as a brainstorming partner. Think of it like conversing with a colleague who has near-infinite patience for your “what if?” questions.

- **Idea Generation**: Prompt the AI to suggest statistical approaches or exploratory analyses you haven’t thought about. This can be a great reminder of that technique you learned years ago and haven’t been using lately.
- **Early Feedback**: Before you commit to more involved data-gathering, use AI to check whether an approach is viable or if certain lines of inquiry seem promising.

### 2\. The “AI Intern” Metaphor

It can help to see AI as an intern: enthusiastic, speedy, and sometimes a bit clueless. You wouldn’t blindly trust an intern with your entire project, but you would give them tasks that free up your cognitive space.

- **Delegate Repetitive Tasks**: Cleaning data, performing routine calculations, or running initial exploratory analyses.
- **Maintain Oversight**: Always review the output and check for errors. Even the best intern needs a watchful manager to verify and correct mistakes. Your AI intern won’t be discouraged and can (usually) respond appropriately.

### 3\. Provide Tasks You Can Verify

One of the safest ways to incorporate AI into your workflow is by assigning it tasks where you can quickly verify the results:

- **Cross-Checkable Calculations**: Summarize means, medians, or other basic descriptive statistics that you can verify by hand or with a spreadsheet.
- **Script Generation**: Have the AI propose an R or Python script for a particular analysis, then run and validate the script yourself.

_Tip:_ If you have a small test dataset, run the AI-generated script on that first. If it produces the right output for the test dataset, there’s a good chance the code will scale well to the larger set.

---

## Concerns with Data Privacy

### Valid Concerns

Data privacy is always a consideration when working with an AI or any online service. Schools and districts handle sensitive information about students, staff, and parents. Sharing these data directly with an external AI service can be risky, especially if the model stores or shares the data for further training.

### Working with Public or Aggregated Data

One option is to use data that’s already public or aggregated at a high level. Community messaging and board reports regularly require data already in the public domain. Data that doesn’t identify individual students can still provide valuable insights and can be fed into AI models with minimal risk. For instance:

- **State-Level Summary Statistics**
- **District- or School-Wide Aggregated Data**:

### Options for De-Identifying Data

When you do want to work with real (but sensitive) data:

1. **Scrub Identifying Details**: Remove names, addresses, ID numbers, etc.
2. **Convert to Anonymized IDs**: Replace personal identifiers with random, unique IDs. An LLM can generate these in one chat before starting a second chat to conduct the actual analysis.
3. **Aggregate or Bucket**: Instead of individual-level data, group it by categories (e.g., “students scoring in the 80–90% range”).
4. **Use a Closed Model**: While these solutions are outside the scope of this blog post, some LLMs can be accessed within private server instances or downloaded and run directly on your own device without sending data anywhere.

_Heads-up:_ Even de-identified data can sometimes be re-identified with enough cross-reference points. So remain cautious and always follow your organization’s data security policies.

---

## Process or Workflow

AI often benefits from an **explicit instruction approach**, reminiscent of good teaching practices. Here’s a potential step-by-step workflow:

1. **Activate Prior Knowledge**

   - Upload or reference your dataset, or at least give the AI a sample. This helps the model contextualize requests.
   - Example: “Here is a sample of the first 10 rows of data for eighth-grade math scores. How should I clean this data to prepare it for further analysis?”

2. **Start Simple or Provide Worked Examples**

   - Just like you’d demonstrate an example math problem before letting students try, show the AI a smaller subset or an example calculation.
   - Example: “Here are three hypothetical students’ math scores. Write Python code to calculate the mean and median.”

3. **Check for Understanding**

   - Ask the AI to explain its logic or break down the steps it took. This is a sanity check to ensure that the model is doing what you expect.
   - Example: “Explain why you chose these variables and justify your formula choice.”

4. **Increase Difficulty Gradually**

   - Once you confirm the AI’s method is correct on small tasks, scale up to bigger requests.
   - Example: “Now apply the same logic to the full dataset of 5,000 students and generate a summary of descriptive statistics.”

5. **Independent Practice**
   - If everything works smoothly, you can trust the AI to execute the process repeatedly \- just remember to keep an eye on the results.
   - Example: “Based on your work so far, create a visualization for each of the other schools in the data set.”

_Heads-up:_ Just because an AI can handle a task that seems complex doesn’t mean you can trust it with tasks that seem simpler. AI strengths and weaknesses don’t always align with human intuition. Check the output of each task type without making assumptions about what the model can do. Updates to models can sometimes reduce capabilities: when OpenAI first released GPT-4o, it lost the ability to create stacked bar charts that GPT-4 had done well. While this functionality was added to 4o, it was a frustrating twist in the update process\!

---

## Ready to Put Your New Intern to Work?

While LLMs aren’t perfect at numeric calculations on their own, their ability to write code and scripts to perform data analysis tasks is a game-changer. By treating AI like an energetic intern that needs oversight, you can free yourself from repetitive tasks, focus on higher-order data exploration, and save valuable time. Keeping data privacy front and center means that public or anonymized data is the best place to start.

As AI technology continues to evolve, we’ll see more robust solutions and specialized tools designed for secure, reliable data analysis. For now, with the right combination of cautious oversight and a willingness to experiment, you can tap into a powerful data-analysis partner that never sleeps—though sometimes it talks a little too confidently.
