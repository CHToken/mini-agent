#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config({ override: true });
import { runAgent } from "./agent.js";

async function handlePrompt(prompt) {
  const { skillUsed, response } = await runAgent(prompt);
  console.error(skillUsed ? `[mini-agent] matched skill: ${skillUsed}` : "[mini-agent] no skill matched");
  console.log(response);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node src/index.js "<your prompt>"');
    console.log("   or: node src/index.js --interactive");
    process.exit(0);
  }

  if (args[0] === "--interactive" || args[0] === "-i") {
    const readline = await import("node:readline/promises");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    console.log('mini-agent interactive mode. Type "exit" to quit.\n');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const prompt = await rl.question("> ");
      if (prompt.trim().toLowerCase() === "exit") break;
      await handlePrompt(prompt);
      console.log("");
    }
    rl.close();
    return;
  }

  await handlePrompt(args.join(" "));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
