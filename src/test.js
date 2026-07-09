import assert from "node:assert";
import Anthropic from "@anthropic-ai/sdk";
import { loadSkills } from "./skillLoader.js";
import { matchSkill } from "./skillMatcher.js";
import { runAgent } from "./agent.js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const MODEL = "claude-sonnet-4-5-20250929";

async function runTests() {
  console.log("Running mini-agent tests...\n");

  // Test 1: Load Skills
  console.log("Test 1: Loading skills...");
  const skills = loadSkills();
  assert.ok(skills.length >= 3, "Should load at least 3 skills");
  const slugs = skills.map((s) => s.slug);
  assert.ok(slugs.includes("welcome-me"), "Should contain welcome-me skill");
  assert.ok(slugs.includes("changelog"), "Should contain changelog skill");
  assert.ok(slugs.includes("documentation"), "Should contain documentation skill");
  console.log("✓ Load skills test passed.\n");

  // Setup Anthropic client for matcher tests
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Test 2: Match welcome-me
  console.log("Test 2: Matching onboarding prompt...");
  const matchedWelcome = await matchSkill(
    anthropic,
    MODEL,
    "new to this project what should i do",
    skills
  );
  assert.ok(matchedWelcome, "Should match a skill");
  assert.strictEqual(matchedWelcome.slug, "welcome-me", "Should match welcome-me");
  console.log("✓ Onboarding prompt matching passed.\n");

  // Test 3: Match unrelated query (weather)
  console.log("Test 3: Matching unrelated prompt...");
  const matchedUnrelated = await matchSkill(
    anthropic,
    MODEL,
    "what's the weather like today?",
    skills
  );
  assert.strictEqual(matchedUnrelated, null, "Should not match any skill for weather");
  console.log("✓ Unrelated prompt matching passed.\n");

  // Test 3b: Match unrelated query (general knowledge)
  console.log("Test 3b: Matching general knowledge prompt (unrelated)...");
  const matchedGenKnowledge = await matchSkill(
    anthropic,
    MODEL,
    "what is the capital of France?",
    skills
  );
  assert.strictEqual(matchedGenKnowledge, null, "Should not match any skill for general knowledge");
  console.log("✓ General knowledge prompt matching passed.\n");

  // Test 3c: Match changelog
  console.log("Test 3c: Matching changelog prompt...");
  const matchedChangelog = await matchSkill(
    anthropic,
    MODEL,
    "please format my git commits into a user-facing release log",
    skills
  );
  assert.ok(matchedChangelog, "Should match a skill for changelog");
  assert.strictEqual(matchedChangelog.slug, "changelog", "Should match changelog");
  console.log("✓ Changelog prompt matching passed.\n");

  // Test 3d: Match documentation
  console.log("Test 3d: Matching documentation prompt...");
  const matchedDocs = await matchSkill(
    anthropic,
    MODEL,
    "generate some docstrings for this python method",
    skills
  );
  assert.ok(matchedDocs, "Should match a skill for documentation");
  assert.strictEqual(matchedDocs.slug, "documentation", "Should match documentation");
  console.log("✓ Documentation prompt matching passed.\n");

  // Test 4: End-to-end welcome-me execution
  console.log("Test 4: Running full welcome-me agent execution...");
  const result = await runAgent("I'm new here, what do I do?");
  assert.strictEqual(result.skillUsed, "welcome-me");
  assert.ok(
    result.response.trim().startsWith("> Welcome to our agent!"),
    "Response should start with the required header"
  );
  console.log("✓ Agent execution test passed.\n");

  console.log("All tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
