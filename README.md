# OpenCode App

AI-powered development tool — standalone web frontend extracted from the OpenCode monorepo.

## Prerequisites

- [Bun](https://bun.sh/) >= 1.3.14

## Installation

```bash
bun install
```

## Development

Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page reloads on edits.

The app requires an OpenCode backend server. For local development, start the backend separately:

```bash
# From a separate opencode installation
opencode serve --port 4096
```

Then configure the app to point to it via environment variables:

- `VITE_OPENCODE_SERVER_HOST` — backend host (default: `127.0.0.1`)
- `VITE_OPENCODE_SERVER_PORT` — backend port (default: `4096`)

### Channel / Dev Badge

Running `bun dev` without setting `OPENCODE_CHANNEL` defaults to the `dev` channel, which shows a **"DEV"** badge in the top-left titlebar and enables dev-only UI features (debug bar, new layout designs, etc.) that differ from the production site.

To match the production experience, set the channel explicitly:

```bash
OPENCODE_CHANNEL=prod bun dev
```

Available channels: `dev` (default), `beta`, `prod` / `latest`.

## Build

```bash
bun run build
```

Production output goes to the `dist/` folder.

## Testing

### Unit Tests

```bash
bun test
```

### E2E Tests

Requires a running backend at `localhost:4096`:

```bash
bunx playwright install chromium
bun run test:e2e
```

Environment options:

- `PLAYWRIGHT_SERVER_HOST` / `PLAYWRIGHT_SERVER_PORT` (backend address, default: `localhost:4096`)
- `PLAYWRIGHT_PORT` (Vite dev server port, default: `3000`)

## Type Checking

```bash
bun run typecheck
```

## Project Structure

```
src/
├── lib/
│   ├── core-util/    # Utility functions (from @opencode-ai/core)
│   ├── sdk/          # SDK client and types (from @opencode-ai/sdk)
│   └── ui/           # UI components, themes, i18n (from @opencode-ai/ui)
├── components/       # App-specific UI components
├── context/          # SolidJS context providers
├── pages/            # Page-level components
├── utils/            # App utilities
└── i18n/             # App-level translations
```

## License

MIT
