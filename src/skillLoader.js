import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const SKILLS_DIR = path.resolve(process.cwd(), ".skills");

/**
 * Discover all skills under .skills/<slug>/SKILL.md.
 *
 * This only reads the YAML frontmatter (name + description) plus the
 * markdown body. It does NOT decide whether a skill applies — that is
 * the job of skillMatcher.js. Keeping discovery and matching separate
 * mirrors the spec's progressive-disclosure model: only name+description
 * need to be in context for routing, the full body is loaded later.
 *
 * @returns {Array<{slug: string, name: string, description: string, body: string}>}
 */
export function loadSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];

  const entries = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const skills = [];

  for (const entry of entries) {
    const skillPath = path.join(SKILLS_DIR, entry.name, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;

    const raw = fs.readFileSync(skillPath, "utf-8");
    const { data, content } = matter(raw);

    if (!data.name || !data.description) {
      console.error(
        `[mini-agent] skipping "${entry.name}": SKILL.md is missing "name" or "description" frontmatter`
      );
      continue;
    }

    skills.push({
      slug: entry.name,
      name: data.name,
      description: data.description,
      body: content.trim(),
    });
  }

  return skills;
}
