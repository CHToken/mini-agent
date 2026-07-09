# mini-agent

A minimal Node.js CLI agent that implements the core idea of the Agent Skills
specification: skills live as `SKILL.md` files, are matched against the
user's prompt using only their name/description (not their full body), and
only the matched skill's instructions are loaded into context to shape the
response.

## Project structure

```
mini-agent/
├── .skills/
│   ├── welcome-me/SKILL.md    # required onboarding skill
│   ├── changelog/SKILL.md     # registry skill #1 (Changelog Generator)
│   └── documentation/SKILL.md # registry skill #2 (Documentation)
├── src/
│   ├── index.js         # CLI entry point
│   ├── agent.js          # orchestration: load → match → respond
│   ├── skillLoader.js     # discovers & parses .skills/*/SKILL.md
│   └── skillMatcher.js    # core skill-matching logic
├── package.json
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env
# then put your real key in .env
```

You need an `ANTHROPIC_API_KEY` with access to `claude-sonnet-5`.

## Demo instructions

Single command to run:

```bash
node src/index.js "I'm new to this project, what should I do"
```

Other example prompts to try:

```bash
node src/index.js "write me a changelog entry for fixing the login bug and adding dark mode"
node src/index.js "what's the weather like today"
node src/index.js "write API documentation for: function runAgent(prompt) { ... }"
```

Interactive mode:

```bash
node src/index.js --interactive
```

Each run prints which skill (if any) was matched to stderr, e.g.
`[mini-agent] matched skill: welcome-me`, then prints the model's response
to stdout — so you can see the routing decision separately from the answer.
For the onboarding prompt, the first line of stdout should read exactly
`> Welcome to our agent!`.

## How skill matching works

1. **Discovery** (`skillLoader.js`) — scans `.skills/*/SKILL.md`, parses the
   YAML frontmatter (`name`, `description`) and keeps the markdown body
   separate.
2. **Routing** (`skillMatcher.js`) — sends only the slug + description of
   every skill (never the full body) plus the user's message to Claude, and
   asks it to return the single best-matching skill slug, or `null`. This
   is the "progressive disclosure" idea from the spec: the model shouldn't
   need to read every skill's full instructions just to decide which one
   (if any) applies.
3. **Execution** (`agent.js`) — if a skill matched, its full body is
   injected into the system prompt as "active skill instructions" and the
   final response is generated. If nothing matched, the model answers with
   no skill in context at all — unrelated skills (like `welcome-me` for a
   weather question) are never loaded.

Routing is done with a real (cheap, `max_tokens: 50`) Claude call rather
than keyword/regex matching, because skill descriptions are natural
language and real prompts rarely share exact keywords with them (e.g. "new
here, what should I do" vs. a description written in third person).

## Note on the required header text

The assignment email's instructions specify that when a user asks "new to this project what should i do", the welcome-me skill should be selected and it should print the required header `> Welcome to our agent!`.

Both `changelog` and `documentation` follow the registry's templates and are fully compliant.

## Submission

**Time spent:** ~2 hours.

**Challenges:**
- The discrepancy between the email's required header (`> Welcome to our agent!`) and the repository's reference `SKILL.md` (`> Welcome to our Command Code assignment agent!`). Aligning these to the email instructions was important to pass evaluation.
- Ensuring only the matched skill is loaded into the model's context (progressive disclosure) while preventing unmatched skills from leaking into the system instructions.
- Correctly parsing YAML frontmatter and structuring routing so that natural language queries map to the right skill slug.

**Demo instructions:**
Run the CLI using:
```bash
node src/index.js "<your prompt>"
```
Examples:
- `node src/index.js "I'm new to this project, what should I do"` (Matches `welcome-me`)
- `node src/index.js "write me a changelog entry for fixing the login bug and adding dark mode"` (Matches `changelog`)
- `node src/index.js "write API documentation for: function runAgent(prompt) { ... }"` (Matches `documentation`)
- `node src/index.js "what's the weather like today?"` (No skill matched)
