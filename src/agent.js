import Anthropic from "@anthropic-ai/sdk";
import { loadSkills } from "./skillLoader.js";
import { matchSkill } from "./skillMatcher.js";

const MODEL = "claude-sonnet-4-5-20250929";

const BASE_SYSTEM = `You are mini-agent, a small helpful CLI coding assistant.
Answer the user's message directly and concisely.`;

/**
 * Run one turn of the agent: discover skills, route the prompt to at most
 * one skill, then generate a response. If a skill matched, its full
 * SKILL.md body is injected into the system prompt and the model is
 * instructed to follow it; otherwise the model answers with no skill
 * context at all (the unmatched skills are never loaded).
 *
 * @param {string} userPrompt
 * @returns {Promise<{skillUsed: string | null, response: string}>}
 */
export async function runAgent(userPrompt) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const skills = loadSkills();

  const matched = await matchSkill(anthropic, MODEL, userPrompt, skills);

  const system = matched
    ? `${BASE_SYSTEM}

---
Active skill: ${matched.name}
Follow these instructions exactly when composing your reply:

${matched.body}`
    : BASE_SYSTEM;

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  const response = res.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return { skillUsed: matched ? matched.slug : null, response };
}
