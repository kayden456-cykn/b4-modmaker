import { OpenRouter } from "@openrouter/sdk";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { SYSTEM_PROMPT } from "./systemPrompt.js";

const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID,
  OPENROUTER_API_KEY,
} = process.env;

const MODEL = process.env.B4_MODEL ?? "openrouter/free";
const MAX_OUTPUT_TOKENS = Number(process.env.B4_MAX_TOKENS ?? 8192);

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !OPENROUTER_API_KEY) {
  console.error(
    "Missing environment variables. Set DISCORD_TOKEN, DISCORD_CLIENT_ID, and OPENROUTER_API_KEY in Railway Variables.",
  );
  process.exit(1);
}

const openrouter = new OpenRouter({ apiKey: OPENROUTER_API_KEY });
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
type ChatMessage = { role: "user" | "assistant"; content: string };
const histories = new Map<string, ChatMessage[]>();

const promptCommands = [
  ["create", "Generate complete code and project files"],
  ["build", "Get build setup and instructions"],
  ["debug", "Find and fix code errors"],
  ["explain", "Understand code and how it works"],
  ["optimize", "Improve code quality and performance"],
  ["convert", "Convert code to another language or format"],
] as const;

const commandData = [
  ...promptCommands.map(([name, description]) =>
    new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .addStringOption((option) =>
        option
          .setName("prompt")
          .setDescription("Describe what you want B4 MODMAKER to do")
          .setRequired(true)
          .setMaxLength(4000),
      )
      .addStringOption((option) =>
        option
          .setName("language")
          .setDescription("Programming language or framework (optional)")
          .setRequired(false)
          .setMaxLength(100),
      ),
  ),
  new SlashCommandBuilder().setName("reset").setDescription("Clear your B4 MODMAKER conversation history"),
  new SlashCommandBuilder().setName("help").setDescription("Show B4 MODMAKER commands"),
];

const helpMessage = [
  "**B4 MODMAKER commands**",
  "`/create prompt: language:` Generate code and complete files",
  "`/build prompt: language:` Get build setup and instructions",
  "`/debug prompt: language:` Find and fix errors",
  "`/explain prompt: language:` Explain code",
  "`/optimize prompt: language:` Improve code",
  "`/convert prompt: language:` Convert code or formats",
  "`/reset` Clear your conversation history",
  "`/help` Show this message",
  "",
  "**Language examples:** JavaScript, TypeScript, Python, C#, C++, Java, Rust, Lua, Kotlin, Swift.",
  "The language option is optional. If omitted, B4 MODMAKER will infer the language or preserve the language of existing code.",
  "You can paste code directly into the prompt. For very long files, send the relevant section or error message.",
].join("\n");

function makePrompt(command: string, input: string, language?: string | null): string {
  const instructions: Record<string, string> = {
    create: "Create the following. Output complete files with exact filenames and locations, dependencies, and build commands. State assumptions.",
    build: "Give the complete build setup and exact build commands for this project. Include required dependencies, config files, and likely failure points.",
    debug: "Debug this. Identify the root cause, then output the complete corrected file(s) with exact filenames.",
    explain: "Explain this code clearly and precisely: purpose, flow, key APIs, and pitfalls. Do not invent details that aren't in the code.",
    optimize: "Optimize this for performance and quality. Output the complete optimized file(s) and briefly list what changed and why.",
    convert: "Convert this as requested. Output the complete converted file(s) with filenames. State assumptions and anything that doesn't map 1:1.",
  };
  const languageInstruction = language?.trim()
    ? `\n\nUser-specified programming language or framework: ${language.trim()}. Use this preference for generated or modified code. When analyzing existing code, preserve its current language unless the user explicitly asks to convert it.`
    : "";
  return `${instructions[command] ?? "Help with this request."}${languageInstruction}\n\n${input}`;
}

function splitMessage(value: string, limit = 1900): string[] {
  const chunks: string[] = [];
  let remaining = value.trim() || "The AI returned an empty response.";
  while (remaining.length > limit) {
    let cut = remaining.lastIndexOf("\n", limit);
    if (cut < limit * 0.5) cut = limit;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut).trimStart();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function registerCommands(): Promise<void> {
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN!);
  const body = commandData.map((command) => command.toJSON());

  if (DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, DISCORD_GUILD_ID), { body });
    console.log(`Registered ${body.length} guild slash commands in ${DISCORD_GUILD_ID}.`);
  } else {
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID!), { body });
    console.log(`Registered ${body.length} global slash commands.`);
  }
}

async function handlePrompt(interaction: ChatInputCommandInteraction): Promise<void> {
  const command = interaction.commandName;
  const userInput = interaction.options.getString("prompt", true);
  const language = interaction.options.getString("language");
  const historyKey = interaction.user.id;
  const history = histories.get(historyKey) ?? [];

  await interaction.deferReply({ ephemeral: true });

  const userMessage: ChatMessage = {
    role: "user",
    content: makePrompt(command, userInput, language),
  };
  history.push(userMessage);

  try {
    const response = await openrouter.chat.send({
      chatRequest: {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
        ],
        maxCompletionTokens: MAX_OUTPUT_TOKENS,
        stream: false,
      },
    });

    const content = response.choices[0]?.message?.content;
    const answer = typeof content === "string" ? content.trim() : "";
    history.push({ role: "assistant", content: answer || "I couldn't generate a text response." });
    histories.set(historyKey, history.slice(-20));

    const chunks = splitMessage(answer);
    await interaction.editReply(chunks[0]);
    for (const chunk of chunks.slice(1)) {
      await interaction.followUp({ content: chunk, ephemeral: true });
    }
  } catch (error) {
    history.pop();
    histories.set(historyKey, history);
    console.error("OpenRouter request failed:", error);
    const message =
      error instanceof Error ? error.message.slice(0, 1200) : "Unknown API error";
    await interaction.editReply(
      `I couldn't complete that request. Check the Railway logs and your OpenRouter API key/model settings.\n\n${message}`,
    );
  }
}

client.once("ready", (readyClient) => {
  console.log(`B4 MODMAKER is online as ${readyClient.user.tag}.`);
  console.log(`Using OpenRouter model: ${MODEL}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    await interaction.reply({ content: helpMessage, ephemeral: true });
    return;
  }

  if (interaction.commandName === "reset") {
    histories.delete(interaction.user.id);
    await interaction.reply({
      content: "Your B4 MODMAKER conversation history has been cleared.",
      ephemeral: true,
    });
    return;
  }

  await handlePrompt(interaction);
});

async function main(): Promise<void> {
  await registerCommands();
  await client.login(DISCORD_TOKEN);
}

main().catch((error) => {
  console.error("B4 MODMAKER failed to start:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});
