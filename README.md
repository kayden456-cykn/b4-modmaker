# B4 MODMAKER (TypeScript)

B4 MODMAKER is a command-line AI coding assistant powered by the Anthropic API.

## 1. Install requirements

Install [Node.js 20 or newer](https://nodejs.org/), then open a terminal in the project folder and run:

```bash
npm install
npm i @anthropic-ai/sdk
npm i -D typescript tsx @types/node
```

## 2. Get an Anthropic API key

1. Go to the [Anthropic Console](https://console.anthropic.com/).
2. Sign in or create an Anthropic account.
3. Open **Settings → API keys**, or visit the [API keys page](https://console.anthropic.com/settings/keys).
4. Select **Create Key**, give it a name such as `B4 MODMAKER`, and copy the key.
5. If prompted, set up the API billing or usage access required by Anthropic.

Keep the key private. Do not post it in Discord, screenshots, messages, or GitHub. If you accidentally expose it, revoke it in the Anthropic Console and create a new one.

## 3. Configure your API key

Copy the example environment file:

```bash
cp .env.example .env
```

Open the new `.env` file and add your key:

```env
ANTHROPIC_API_KEY=sk-ant-your-real-key-here
B4_MODEL=claude-sonnet-5-5
B4_MAX_TOKENS=8192
```

Replace `sk-ant-your-real-key-here` with the key you copied. Do not include quotes. The `.env` file is ignored by Git, so your secret should stay out of commits. Never put your real key in `.env.example`.

## 4. Run B4 MODMAKER

Start in development mode:

```bash
npm run dev
```

Or build and start:

```bash
npm run build
npm start
```

## Commands

- `/create`
- `/build`
- `/debug`
- `/explain`
- `/optimize`
- `/convert`
- `/reset`
- `/help`
- `/exit`
