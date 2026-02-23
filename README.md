## OpsWeaver

OpsWeaver is a hackathon-ready crisis operations board that turns raw field updates into a synchronized mission thread for emergency managers. Responders paste the situation, assets, and planning horizon, then the app uses OpenAI’s JSON-mode Responses API to output a runbook with timeline phases, resource gaps, risk radar, and a broadcast-ready comms kit. Every sync is cached locally so command posts can refresh the same shared operating picture within seconds.

### Key features

- **AI Incident Action Planning** – Structured JSON schema enforces high-signal timelines, resource math, and lifeline metrics pulled straight from your scenario.
- **Decision Snapshot UI** – Shadcn components, responsive cards, and animated loaders keep the experience demo-ready on stage or in a field trailer.
- **Local persistence** – The latest mission thread survives hard refreshes via browser storage so teams can resume without exporting files.
- **Vercel-friendly** – Bun, Next.js App Router, and iframe-safe headers allow instant deploys and judge-friendly embeds.

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- Node.js 18+ runtime (Vercel builds on ≥18 automatically)
- `OPENAI_API_KEY` available in your environment (Anthropic/OpenRouter also work if you swap the provider)

Create an `.env.local` with:

```bash
OPENAI_API_KEY=sk-your-key
```

### Development

```bash
# install deps
bun install

# run linting
bun run lint

# start dev server
bun dev
```

Visit `http://localhost:3000` to drive the experience. The command panel will persist your latest plan between refreshes.

### Production build / verification

OpsWeaver follows the TreeHacks verification ritual:

```bash
rm -rf node_modules
bun install
bun run lint
bun run build
```

If build succeeds you’re ready to `vercel deploy` or rely on the automatic deployment triggered by `treemux-report`.
