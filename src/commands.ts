export interface Command {
  name: string;
  usage: string;
  description: string;
  /** Turns the user's argument into the prompt sent to the model. */
  build: (arg: string) => string;
}

export const COMMANDS: Command[] = [
  {
    name: "create",
    usage: "/create <prompt>",
    description: "Generate complete code/files for a task",
    build: (arg) =>
      `Create the following. Output complete files with exact filenames and locations, dependencies, and build commands. State any assumptions.\n\n${arg}`,
  },
  {
    name: "build",
    usage: "/build <project>",
    description: "Build setup, Gradle/Unity/CMake steps and fixes",
    build: (arg) =>
      `Give the complete build setup and exact build commands for this project. Include required dependencies, config files (full contents), and likely failure points.\n\n${arg}`,
  },
  {
    name: "debug",
    usage: "/debug <code or error>",
    description: "Find and fix bugs, crashes, errors",
    build: (arg) =>
      `Debug this. Identify the root cause, then output the complete corrected file(s) with exact filenames.\n\n${arg}`,
  },
  {
    name: "explain",
    usage: "/explain <code>",
    description: "Explain what code does",
    build: (arg) =>
      `Explain this code clearly and precisely: purpose, flow, key APIs, and any pitfalls. Do not invent details that aren't in the code.\n\n${arg}`,
  },
  {
    name: "optimize",
    usage: "/optimize <code>",
    description: "Improve performance and quality",
    build: (arg) =>
      `Optimize this for performance (and Quest/mobile constraints where relevant). Output the complete optimized file(s) and briefly list what changed and why.\n\n${arg}`,
  },
  {
    name: "convert",
    usage: "/convert <code> (state the target language/format)",
    description: "Convert code between languages/formats",
    build: (arg) =>
      `Convert this as requested. Output the complete converted file(s) with filenames. State assumptions and anything that doesn't map 1:1.\n\n${arg}`,
  },
];

export function helpText(): string {
  const rows = COMMANDS.map((c) => `  ${c.usage.padEnd(48)} ${c.description}`);
  return [
    "B4 MODMAKER commands:",
    ...rows,
    `  ${"/reset".padEnd(48)} Clear conversation history`,
    `  ${"/exit".padEnd(48)} Quit`,
    `  ${"/help".padEnd(48)} Show this help`,
    "",
    "Tips:",
    '  - Multi-line input: type """ on its own line, paste, then """ again.',
    "  - Include a text file inline with @file:path/to/File.cs",
    "  - Plain text with no command is treated as a normal chat message.",
  ].join("\n");
}
