# B4 MODMAKER

B4 MODMAKER is a Discord slash-command coding assistant powered by Anthropic and hosted on Railway.

## Features

- `/create` — generate code and complete files
- `/build` — get build setup and instructions
- `/debug` — find and fix errors
- `/explain` — understand code
- `/optimize` — improve code quality and performance
- `/convert` — convert code and formats
- `/reset` — clear your conversation history
- `/help` — show the command list

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

## 2. Get an Anthropic API key

1. Go to the [Anthropic Console](https://console.anthropic.com/).
2. Sign in or create an Anthropic account.
3. Open **Settings → API keys**, or visit the [API keys page](https://console.anthropic.com/settings/keys).
4. Select **Create Key**, name it (for example, `B4 MODMAKER`), and copy it.
5. Set up any billing or API access Anthropic requires for your account.

Keep the API key private. If it is exposed, revoke it in the Anthropic Console and create a replacement. Never put real keys in `.env.example` or GitHub.

## 3. Deploy to Railway

1. Push this repository to GitHub.
2. Open [Railway](https://railway.com/) and create a project.
3. Choose **Deploy from GitHub Repo** and select `kayden456-cykn/b4-modmaker`.
4. In the service's **Variables** tab, add the variables below.
5. In **Settings → Deploy**, use:
   - Build Command: `npm run build`
   - Start Command: `npm start`
6. Deploy. Check the deployment logs for **B4 MODMAKER is online**.

### Railway variables

Add these in Railway's Variables tab (do not include quotes):

| Variable | Value |
|---|---|
| `DISCORD_TOKEN` | Your Discord bot token |
| `DISCORD_CLIENT_ID` | Application Client ID from OAuth2 |
| `DISCORD_GUILD_ID` | Your Discord server ID (recommended for instant guild command updates) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `B4_MODEL` | `claude-sonnet-5-5` |
| `B4_MAX_TOKENS` | `8192` |

For quick command registration, set `DISCORD_GUILD_ID`. If you leave it blank, commands are registered globally and may take longer to appear.

## 4. Use the bot

Once Railway says the bot is online, open your Discord server and try:

```text
/create Make a simple JavaScript calculator
/debug [paste your error and code]
/explain [paste code]
/help
```

The prompt option accepts up to 4,000 characters. Replies are sent privately. Each user's recent conversation is remembered in memory while the service stays running; a restart clears it.

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
