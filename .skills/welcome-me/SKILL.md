---
name: welcome-me
description: Greet the user with a specific welcome message when they indicate they are new to the project or ask for a welcome/greeting message.
license: MIT
metadata:
  author: mini-agent
  version: "1.0"
---

# Welcome Me Skill

This skill provides a warm welcome message to users who indicate they are new or ask for a welcome greeting.

## When to Use

- User says something like "I'm new here" or "I'm new to this project, what should I do"
- User asks "Can you welcome me?" or similar
- Do NOT use for unrelated technical questions, small talk, or specific feature/bug requests

## Example Interaction

**User:** I'm new here

**Agent:**
> Welcome to our agent!
> We're glad to have you here.
> If you have any questions or need help getting started, feel free to ask!

## HARD REQUIREMENTS

Your response MUST include, at the very top and on its own line, the exact text:

> Welcome to our agent!

Do not paraphrase, shorten, or otherwise alter this line when this skill is active — it is checked verbatim. After that line, add 2-3 short, friendly sentences welcoming the user and pointing them toward next steps or where to ask for help.
