---
type: software
title: LessonLens
description: A private coaching tool for teachers — record or import a lesson and get AI feedback on specific teaching techniques that no administrator or evaluator can see.
resource: /software/lessonlens
date: '2026-09-25'
tags:
  - Teaching
  - Staff
  - Privacy
maturity: Production
stack: SwiftUI · Cloud Run · Gemini
repo: https://github.com/psd401/lessonlens
license: MIT
contact: hagelk@psd401.net
image: /images/software/lessonlens-home.png
imageAlt: The LessonLens home screen on a Mac, offering New Recording, Import Audio and Import Video
spec:
  - k: Platform
    v: macOS 14 or later, Apple Silicon
  - k: Transcription
    v: On the teacher's Mac — audio is never uploaded
  - k: Analysis
    v: Google Gemini, under the district's data processing agreement
  - k: Video
    v: Deleted from Google as soon as analysis finishes
  - k: Storage
    v: On the teacher's Mac. The server keeps nothing
  - k: Who sees results
    v: Only the teacher
  - k: Frameworks
    v: Seven, including Teach Like a Champion, Danielson, AVID/WICOR and NBPTS
  - k: Sign-in
    v: Google, @psd401.net accounts only
  - k: Licence
    v: MIT
status: draft
generated:
  by: claude-code/opus-5-5
  at: '2026-09-25'
---

LessonLens gives a teacher a coach nobody else is listening to. Record a lesson or import one, get AI feedback on specific teaching techniques, and reflect on it — without an administrator, an evaluator or a colleague ever seeing any of it.

It is voluntary, and it is not an evaluation tool. It is not used for personnel decisions or performance reviews.

## Private by construction

- **Only the teacher can see their data.** Recordings, transcripts, analysis, reflections and chats.
- **Audio never leaves the Mac.** Transcription runs on the device.
- **Video is deleted immediately after analysis.**
- **The district cannot see what a teacher does.** The server stores no transcripts, results or history. The technology team can see aggregate usage counts, not who made a request or what was in it.
- **Google cannot train on it.** Processing is governed by the district's data processing agreement.

## What it does

- Record live, or import audio or classroom video.
- Detect wait time automatically — pauses of three seconds or more.
- Ask the teacher to reflect *before* showing the AI's feedback, then set their self-ratings beside the AI's.
- Answer follow-up questions in a coaching chat, citing timestamped moments from the lesson.
- Analyse against seven research-based frameworks, including Teach Like a Champion, the Danielson Framework, AVID/WICOR and NBPTS.
- Export a report as PDF or markdown.

Framework names belong to their owners. LessonLens is not affiliated with or endorsed by any of them.
