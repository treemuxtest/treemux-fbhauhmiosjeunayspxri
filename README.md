## PulseMesh

PulseMesh is an AI-first operations desk built at TreeHacks 2026 to help civic responders turn chaotic, multilingual neighborhood reports into a single actionable playbook in minutes. The web app ingests a short incident brief, enriches it with infrastructure heuristics, and streams back a timeline, resource gaps, and comms pushes that map directly to ICS workflows.

### Why it matters

- **Signal fusion** – blends human observations with synthetic “sensor” insights so EOCs can unlock context without waiting for official sitreps.
- **Action-first plans** – OpenAI Responses API returns structured JSON we validate with Zod, so the UI can surface timelines, resource deltas, and comms angles in deterministic widgets.
- **Embeddable + demo-ready** – built with Next.js App Router, shadcn/ui, Bun, and iframe-safe headers for quick judging embeds or Vercel demos.

### Running locally

1. Install Bun if you have not already.
2. Create an `.env.local` file with `OPENAI_API_KEY=...` (Anthropic/OpenRouter keys could be wired similarly).
3. Install deps and start dev mode:

```bash
bun install
bun dev
```

### Production checks

Before shipping, PulseMesh runs `bun run lint`, `bun run build`, and the clean install flow (`rm -rf node_modules && bun install && bun run build`) to guarantee reproducible deploys.
