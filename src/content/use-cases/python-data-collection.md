---
title: Automated Intercom System Data Collection and Organization
description: Development of a Python script to automate the extraction and organization of Informacast notification system dialing codes into school-specific Google Sheets
category: IT & Technical Infrastructure Management
tools_used:
  - Gemini 2.0
  - Visual Studio Code
  - Google Sheets
author: Reese Herber
school: ESC
tags:
  - automation
  - data management
  - python scripting
  - API integration
  - system administration
  - intercom systems
  - workflow optimization
---

## Overview

This use case demonstrates the development of an automated solution for managing Informacast notification system dialing codes. Previously, tracking these codes required manual inspection of each clock/speaker and manual data entry into building-specific sheets. By leveraging Gemini's extended context window capabilities, a Python script was developed to automatically pull information from the Informacast database, organize it by school, and export it to a Google Sheets file with separate tabs for each school. The solution includes nightly automation to ensure building staff have current access to clock/speaker information and dialing codes.

## Prompt Used

```prompt
Please write a complete Python script that retrieves data from an API—using an HTTP GET request—and then parses the returned JSON (whose definition is provided below) to extract all entries corresponding to IP speakers in the environment. The script should identify these IP speakers based on specific attributes in the JSON and extract relevant details such as their name or identifier, IP address, and any other useful attributes like model or status. Once extracted, the script must output these details into a CSV file with appropriate headers. The solution should employ standard Python libraries (such as requests, json, and csv) and include robust error handling to manage potential issues like API connection failures, JSON parsing errors, or the absence of any IP speakers in the data. Additionally, if possible, allow the API endpoint URL and CSV output file name to be passed as command-line arguments to increase flexibility.
```

## Other Content Provided

- Official API documentation in JSON format

## Additional Information

Key features of the automated solution:

- Pulls data directly from Informacast database via API
- Organizes information by school location
- Creates separate tabs per school in Google Sheets
- Runs on an automated nightly schedule
- Improves visibility and accessibility of system information for building staff
- Eliminates manual data collection and entry processes
- Includes error handling and flexible configuration options

The automation significantly improved the efficiency and accuracy of managing the intercom system's configuration data across multiple school buildings.
