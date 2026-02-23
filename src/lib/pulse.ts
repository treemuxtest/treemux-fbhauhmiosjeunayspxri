import { z } from "zod";

export const channelOptions = ["SMS", "Email", "Push", "CERT", "Radio", "Social"] as const;

export const briefSchema = z.object({
  scenario: z.string().min(40, "Share more context so we can reason."),
  incidentType: z.enum(["infrastructure", "health", "climate", "safety"]),
  location: z.string().min(2),
  population: z.number().int().min(0).max(2_000_000),
  hoursToImpact: z.number().min(0).max(72),
  severity: z.number().int().min(1).max(5),
  commsChannels: z.array(z.string()).default([]),
});

export type Brief = z.infer<typeof briefSchema>;

export const planSchema = z.object({
  summary: z.string(),
  signalThemes: z.array(z.string()),
  confidence: z.number().min(0).max(100),
  timeline: z.array(
    z.object({
      phase: z.string(),
      window: z.string(),
      tasks: z.array(z.string()),
    })
  ),
  resourceGaps: z.array(
    z.object({
      asset: z.string(),
      owner: z.string(),
      status: z.enum(["ready", "lagging", "blocked"]),
      impact: z.string(),
    })
  ),
  commsAngles: z.array(z.string()),
});

export type PulsePlan = z.infer<typeof planSchema>;
export type ResourceGap = PulsePlan["resourceGaps"][number];

export const planJsonSchema = {
  name: "pulse_plan",
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "signalThemes",
      "confidence",
      "timeline",
      "resourceGaps",
      "commsAngles",
    ],
    properties: {
      summary: { type: "string" },
      signalThemes: {
        type: "array",
        minItems: 2,
        items: { type: "string" },
      },
      confidence: { type: "number", minimum: 0, maximum: 100 },
      timeline: {
        type: "array",
        minItems: 2,
        items: {
          type: "object",
          required: ["phase", "window", "tasks"],
          properties: {
            phase: { type: "string" },
            window: { type: "string" },
            tasks: {
              type: "array",
              minItems: 2,
              items: { type: "string" },
            },
          },
        },
      },
      resourceGaps: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["asset", "owner", "status", "impact"],
          properties: {
            asset: { type: "string" },
            owner: { type: "string" },
            status: {
              type: "string",
              enum: ["ready", "lagging", "blocked"],
            },
            impact: { type: "string" },
          },
        },
      },
      commsAngles: {
        type: "array",
        minItems: 2,
        items: { type: "string" },
      },
    },
  },
  strict: true,
} as const;

export const fallbackPlan: PulsePlan = {
  summary:
    "Stabilize heat exhaustion risk within 6 hours by splitting inbound volume, deploying paramedic strike teams, and spinning up multilingual comms loops.",
  signalThemes: [
    "Cooling infrastructure saturation",
    "Language access gap",
    "Limited advanced life support coverage",
  ],
  confidence: 74,
  timeline: [
    {
      phase: "Stabilize",
      window: "0-2 hrs",
      tasks: [
        "Trigger overflow site with Parks & Rec keyholder",
        "Pre-stage 2 ALS rigs near Route 87",
        "Spin bilingual SMS blast w/ hydration tips",
      ],
    },
    {
      phase: "Absorb",
      window: "2-6 hrs",
      tasks: [
        "Move CERT volunteers to intake triage",
        "Offer ride credits for vulnerable residents",
        "Deploy shade + misting kit from Depot 3",
      ],
    },
    {
      phase: "Recover",
      window: "6-12 hrs",
      tasks: [
        "Publish after-action status for county EOC",
        "Reset med caches; confirm replenishment ETA",
      ],
    },
  ],
  resourceGaps: [
    {
      asset: "ALS Paramedic Team",
      owner: "County EMS",
      status: "lagging",
      impact: "Need 2 crews to sustain split coverage",
    },
    {
      asset: "Hydration Pallets",
      owner: "Salvation Relief",
      status: "ready",
      impact: "Available within 35 min at Depot 3",
    },
    {
      asset: "Spanish-first Comms Lead",
      owner: "City PIO",
      status: "blocked",
      impact: "Reassign bilingual staff from 311 desk",
    },
  ],
  commsAngles: [
    "30-second mayor voicemail for seniors",
    "TikTok + IG reels translating heat safety",
    "Hospital bed availability ping to dispatch",
  ],
};
