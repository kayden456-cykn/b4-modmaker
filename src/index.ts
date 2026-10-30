import Anthropic from "@anthropic-ai/sdk";
import { createInterface } from "node:readline/promises";
import { readFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import { SYSTEM_PROMPT } from "./systemPrompt.js";
import { COMMANDS, helpText } from "./commands.js";

const MODEL = process.env.B4_MODEL ?? "claude-sonnet-5-5";
const MAX_TOKENS = Number(process.env.B4_MAX_TOKENS ?? 8192);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Copy .env.example to .env and set it.");
  process.exit(1);
}

const client = new Anthropic();
let history: Anthropic.MessageParam[] = [];

/** Replace @file:path tokens with the file's text content in a code fence. */
async function expandFiles(text: string): Promise<string> {
  let result = text;
  for (const match of text.matchAll(/@file:(\S+)/g)) {
    const path = match[1];
    let replacement: string;
    try {
      const content = await readFile(path, "utf8");
      replacement = `\n\`\`\`\n// ${path}\n${content}\n\`\`\`\n`;
    } catch {
      replacement = `[could not read ${path}]`;
    }
    result = result.replace(match[0], () => replacement);
  }
  return result;
}

/** Map "/cmd args" to a prompt; return null if not a command. */
function toPrompt(line: string): string | null {
  if (!line.startsWith("/")) return line;
  const [rawName, ...rest] = line.slice(1).split(/\s+/);
  const arg = line.slice(1 + rawName.length).trim();
  const cmd = COMMANDS.find((c) => c.name === rawName.toLowerCase());
  if (!cmd) {
    console.log(`Unknown command "/${rawName}". Type /help.`);
    return null;
  }
  if (!arg) {
    console.log(`Usage: ${cmd.usage}`);
    return null;
  }
  void rest;
  return cmd.build(arg);
}

async function ask(userText: string): Promise<void> {
  history.push({ role: "user", content: userText });
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: history,
    });
    stream.on("text", (t) => output.write(t));
    const final = await stream.finalMessage();
    output.write("\n\n");
    const text = final.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("");
    history.push({ role: "assistant", content: text });
  } catch (err) {
    history.pop(); // keep history valid so the user can retry
    console.error(`\n[error] ${err instanceof Error ? err.message : String(err)}\n`);
  }
}

async function main(): Promise<void> {
  const rl = createInterface({ input, output });
  console.log(`B4 MODMAKER online (model: ${MODEL}). Type /help for commands.\n`);

  while (true) {
    let line = (await rl.question("b4> ")).trim();
    if (!line) continue;

    // Multi-line block mode
    if (line === '"""') {
      const lines: string[] = [];
      while (true) {
        const next = await rl.question("... ");
        if (next.trim() === '"""') break;
        lines.push(next);
      }
      line = lines.join("\n").trim();
      if (!line) continue;
    } else if (line.startsWith("/") && line.endsWith('"""') === false && line.includes('"""')) {
      // e.g. `/debug """` -> read a block after the command
      const head = line.slice(0, line.indexOf('"""')).trim();
      const lines: string[] = [];
      while (true) {
        const next = await rl.question("... ");
        if (next.trim() === '"""') break;
        lines.push(next);
      }
      line = `${head} ${lines.join("\n")}`.trim();
    }

    const lower = line.toLowerCase();
    if (lower === "/exit" || lower === "/quit") break;
    if (lower === "/help") {
      console.log(helpText() + "\n");
      continue;
    }
    if (lower === "/reset") {
      history = [];
      console.log("History cleared.\n");
      continue;
    }

    const prompt = toPrompt(line);
    if (prompt === null) continue;
    await ask(await expandFiles(prompt));
  }

  rl.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
