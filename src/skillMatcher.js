/**
 * Core skill-matching logic.
 *
 * The Agent Skills spec relies on "progressive disclosure": the model is
 * shown only each skill's name + description (a cheap, short summary) and
 * decides which single skill, if any, is relevant to the user's message.
 * Only the chosen skill's full SKILL.md body is loaded into context
 * afterwards (see agent.js). This keeps unrelated skill instructions out
 * of context and lets routing scale to many skills.
 *
 * We implement routing as a small, separate Claude call rather than
 * naive keyword matching, because skill descriptions are natural language
 * and a user's phrasing rarely matches them verbatim (e.g. "new here,
 * what should I do" vs. a description that says "onboarding question").
 *
 * @param {import("@anthropic-ai/sdk").default} anthropic
 * @param {string} model
 * @param {string} userPrompt
 * @param {Array<{slug: string, name: string, description: string}>} skills
 * @returns {Promise<{slug: string, name: string, description: string, body: string} | null>}
 */
export async function matchSkill(anthropic, model, userPrompt, skills) {
  if (!skills.length) return null;

  const catalog = skills
    .map((s) => `- slug: "${s.slug}"\n  description: "${s.description}"`)
    .join("\n");

  const system = `You are the routing component of a coding agent that implements the Agent Skills specification.

You are given a catalog of available skills (slug + description ONLY — you do not see their full instructions) and a single user message.

Decide whether exactly one skill's description is a genuine match for what the user is asking. Do not force a match just because a skill is loosely related.

Rules:
- Pick at most one skill.
- If no skill clearly applies, the answer is null.
- Respond with ONLY compact JSON, no prose, no markdown fences: {"skill": "<slug>"} or {"skill": null}

Skill catalog:
${catalog}`;

  const res = await anthropic.messages.create({
    model,
    max_tokens: 50,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = res.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null; // if routing output is malformed, fail safe to "no skill"
  }

  if (!parsed || !parsed.skill || parsed.skill === "null") return null;

  return skills.find((s) => s.slug === parsed.skill) || null;
}
