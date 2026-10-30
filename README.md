# B4 MODMAKER

B4 MODMAKER is a Discord slash-command coding assistant powered by OpenRouter and hosted on Railway.

## Features

- `/create` — generate code and complete files
- `/build` — get build setup and instructions
- `/debug` — find and fix code errors
- `/explain` — understand code
- `/optimize` — improve code quality and performance
- `/convert` — convert code and formats
- `/reset` — clear your conversation history
- `/help` — show the command list

All six coding commands have an optional `language` field. Enter a language or framework such as `JavaScript`, `TypeScript`, `Python`, `C#`, `C++`, `Java`, `Rust`, `Lua`, or `Kotlin`. If omitted, B4 MODMAKER infers the language or preserves the language of existing code.

Replies are private (ephemeral). Conversation history is kept separately per Discord user while the bot process is running. It is cleared when the bot restarts or when that user runs `/reset`.

## 1. Create the Discord application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application** and name it **B4 MODMAKER**.
3. Open the **Bot** page and create the bot if prompted.
4. Reset/copy the bot token. Keep it secret.
5. Open **OAuth2 → General** and copy the **Client ID**.
6. To invite it, open **OAuth2 → URL Generator**.
7. Select the `bot` and `applications.commands` scopes.
8. Under Bot Permissions, select **Send Messages**. Open the generated URL and add the bot to your server.
9. Copy your server's ID (enable Developer Mode in Discord, then right-click/tap the server and choose Copy Server ID).

Do not share your bot token with anyone or commit it to GitHub.

## 2. Create an OpenRouter API key

1. Open [OpenRouter API Keys](https://openrouter.ai/keys).
2. Sign in and create a new API key.
3. Copy the key. Keep it private and never commit it to GitHub.

The default model is `openrouter/free`, which automatically selects an available free model. Free model access is rate-limited and availability can vary. See [OpenRouter free models](https://openrouter.ai/collections/free-models).

## 3. Deploy to Railway

1. Open Railway and select the **B4 MODMAKER** service.
2. In the service's **Variables** tab, add the variables below.
3. In **Settings → Deploy**, use:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Deploy. Check the deployment logs for **B4 MODMAKER is online** and **Using OpenRouter model: openrouter/free**.

### Railway variables

Add these in Railway's Variables tab (do not include quotes):

| Variable | Value |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `DISCORD_CLIENT_ID` | Application Client ID from OAuth2 |
| `DISCORD_GUILD_ID` | Your Discord server ID (recommended for instant guild command updates) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `B4_MODEL` | `openrouter/free` |
| `B4_MAX_TOKENS` | `8192` |

For quick command registration, set `DISCORD_GUILD_ID`. If you leave it blank, commands are registered globally and may take longer to appear.

## 4. Use the bot

Once Railway says the bot is online, open your Discord server and try:

```text
/create prompt: Make a calculator language: JavaScript
/debug prompt: Fix this error: ... language: TypeScript
/explain prompt: Explain this code language: C#
/convert prompt: Convert this script language: Python
```

The prompt option accepts up to 4,000 characters. The optional language option accepts up to 100 characters. Replies are sent privately. Each user's recent conversation is remembered in memory while the service stays running; a restart clears it.

## Local development

Requires Node.js 20 or newer.

```bash
npm install
cp .env.example .env
```

Fill in the values in `.env`, then run:

```bash
npm run dev
```

To compile and run:

```bash
npm run build
npm start
```

The `.env` file is ignored by Git. Never commit real tokens or API keys.
