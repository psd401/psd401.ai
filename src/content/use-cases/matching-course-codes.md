---
title: 'Matching Local Course Codes to State Supt. Codes'
description: 'Using AI for data categorization to match course codes from local to state codes'
category: 'Streamlining Administrative Tasks & Operations'
subject: 'Data Categorization'
grade_level: 'Staff'
tools_used:
  - 'ChatGPT'
author: 'James Cantonwine'
school: 'ESC'
tags:
  - 'Data Analysis'
  - 'Categorization'
---

## Overview

The process of matching new courses to OSPI course codes is tedious. Working with an LLM sped up the process and made it more pleasant.

## Prompt Used

```md
This attached file contains approved state course codes. I will be providing you with course titles, and you will search this document and return the State Course Code and Name that best matches the title I provided. If the best match is unclear, you may ask for clarification or suggest two options for me to consider. An example course title would be "Social Media Marketing." You would respond with "12162 - Internet Marketing." For each new title, review the attached file again to make sure you are providing the best match. Please let me know when you have reviewed the file and are ready to begin.
```

## Other Content Provided

The most recent OSPI state course code file for CEDARS

## Any Other Info

Checking the output is as simple as CMD-F!
