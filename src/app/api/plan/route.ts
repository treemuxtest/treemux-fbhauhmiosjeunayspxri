import OpenAI from "openai";
import { NextResponse } from "next/server";

import {
  Brief,
  briefSchema,
  fallbackPlan,
  planJsonSchema,
  planSchema,
} from "@/lib/pulse";

export const runtime = "edge";

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const systemPrompt =
  "You are PulseMesh, an AI incident commander for civic resilience teams. " +
  "Blend the provided brief with practical ICS tactics for the Bay Area. " +
  "Respond with concise sentences (max 24 words each) and prioritize decisive language.";

export async function POST(request: Request) {
  let parsedBrief: Brief;

  try {
    const raw = await request.json();
    parsedBrief = briefSchema.parse({
      ...raw,
      population: Number(raw.population),
      hoursToImpact: Number(raw.hoursToImpact),
      severity: Number(raw.severity),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid incident brief" },
      { status: 400 },
    );
  }

  if (!openai) {
    return NextResponse.json(fallbackPlan);
  }

  try {
    const aiResponse = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [{ type: "text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                brief: parsedBrief,
                request:
                  "Return JSON covering summary, three signal themes, three timeline phases, resource gaps, and communications pushes.",
              }),
            },
          ],
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_schema", json_schema: planJsonSchema },
    });

    const payload = aiResponse.output_text;

    const plan = planSchema.parse(JSON.parse(payload));
    return NextResponse.json(plan);
  } catch (error) {
    console.error("plan route error", error);
    return NextResponse.json(fallbackPlan, { status: 200 });
  }
}
