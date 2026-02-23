import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

export const runtime = "nodejs";

type ResponsesCreateParams = Parameters<OpenAI["responses"]["create"]>[0];

type StructuredResponseParams = ResponsesCreateParams & {
  response_format?: {
    type: "json_schema";
    json_schema: Record<string, unknown>;
  };
};

const planInputSchema = z.object({
  scenario: z.string().min(20, "Provide at least 20 characters of context."),
  location: z.string().min(2, "Location is required."),
  assets: z.string().min(6, "List the critical assets or gaps."),
  timebox: z.number().min(6).max(120),
});

const planSchema = z.object({
  mission: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
    }),
  ),
  resources: z.array(
    z.object({
      name: z.string(),
      available: z.number(),
      needed: z.number(),
      note: z.string().optional(),
    }),
  ),
  risks: z.array(
    z.object({
      label: z.string(),
      level: z.string(),
      action: z.string(),
    }),
  ),
  comms: z.string(),
  metrics: z.object({
    lifeSafety: z.number(),
    lifelines: z.string(),
    intelLatency: z.string(),
  }),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OPENAI_API_KEY missing" }, { status: 500 });
  }

  try {
    const json = await request.json();
    const parsed = planInputSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { scenario, location, assets, timebox } = parsed.data;

    const prompt = `
You are OpsWeaver, an elite incident action planning officer helping city response teams.
Blend ICS best-practices, FEMA lifelines, and logistics heuristics.
Output JSON that matches the supplied schema exactly. Do not include commentary.

Scenario: ${scenario}
Impact zone: ${location}
Assets & gaps: ${assets}
Planning horizon: ${timebox} hours
`;

    const payload = {
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You translate chaotic field intel into decisive, short, jargon-aware playbooks for municipal emergency managers. Keep tone direct, measurable, and operations-focused.",
        },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "opsweaver_plan",
          schema: {
            type: "object",
            properties: {
              mission: {
                type: "array",
                minItems: 3,
                maxItems: 4,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    detail: { type: "string" },
                  },
                  required: ["title", "detail"],
                },
              },
              resources: {
                type: "array",
                minItems: 3,
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    available: { type: "number" },
                    needed: { type: "number" },
                    note: { type: "string" },
                  },
                  required: ["name", "available", "needed"],
                },
              },
              risks: {
                type: "array",
                minItems: 3,
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    level: { type: "string" },
                    action: { type: "string" },
                  },
                  required: ["label", "level", "action"],
                },
              },
              comms: { type: "string" },
              metrics: {
                type: "object",
                properties: {
                  lifeSafety: { type: "number" },
                  lifelines: { type: "string" },
                  intelLatency: { type: "string" },
                },
                required: ["lifeSafety", "lifelines", "intelLatency"],
              },
            },
            required: ["mission", "resources", "risks", "comms", "metrics"],
          },
        },
      },
    } as StructuredResponseParams;

    const completion = await openai.responses.create(payload);

    if (!("output" in completion)) {
      throw new Error("Streaming response not supported in this route.");
    }

    const firstMessage = completion.output?.[0];

    if (!firstMessage || firstMessage.type !== "message") {
      throw new Error("Model did not return message content.");
    }

    const output = firstMessage.content.find(
      (block) => block.type === "output_text",
    );

    if (!output || output.type !== "output_text") {
      throw new Error("Model did not return structured content.");
    }

    const plan = planSchema.parse(JSON.parse(output.text));

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Plan generation failed", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
