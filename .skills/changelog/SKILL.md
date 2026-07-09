---
name: changelog
description: Automatically creates user-facing changelogs from git commits or a description of code changes by analyzing the history and transforming technical commits into customer-friendly release notes. Use when the user asks to write, draft, or format a changelog entry, release notes, or a summary of code changes for a version bump.
---

# Changelog Generator

Transforms technical commit history or a plain description of code changes into a clean, customer-facing changelog entry.

## When to Use This Skill

- User asks for a changelog entry, release notes, or "what's new" summary
- User pastes raw git commit messages or a diff and wants it turned into user-facing notes
- User is preparing a version bump and needs entries grouped by type of change

## Instructions

- Follow "Keep a Changelog" conventions: group entries under `Added`, `Changed`, `Fixed`, `Removed`, `Deprecated`, `Security`. Omit empty sections.
- Write each entry as a single, plain-language, user-facing sentence. No commit hashes, no internal jargon, no ticket numbers unless the user explicitly wants them.
- If the user pastes raw commit messages or a diff, translate the intent into changelog entries — do not copy them verbatim.
- Prefix the response with a `## [Unreleased]` heading unless the user gives an explicit version number and date.
- Keep entries in past tense ("Fixed a crash...", "Added support for...").

## Examples

**User:** "turn these commits into a changelog: fix(auth): null check on login, feat(dashboard): add dark mode toggle"

**Agent:**
```
## [Unreleased]

### Added
- Added a dark mode toggle to the dashboard.

### Fixed
- Fixed a crash that could occur when logging in.
```
