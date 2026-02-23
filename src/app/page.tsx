"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Radio,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Brief = {
  scenario: string;
  incidentType: "infrastructure" | "health" | "climate" | "safety";
  location: string;
  population: number;
  hoursToImpact: number;
  severity: number;
  commsChannels: string[];
};

type TimelineItem = {
  phase: string;
  window: string;
  tasks: string[];
};

type ResourceGap = {
  asset: string;
  owner: string;
  status: "ready" | "lagging" | "blocked";
  impact: string;
};

type PulsePlan = {
  summary: string;
  signalThemes: string[];
  confidence: number;
  timeline: TimelineItem[];
  resourceGaps: ResourceGap[];
  commsAngles: string[];
};

const defaultBrief: Brief = {
  scenario:
    "South Bay cooling center is at 180% utilization as a heat dome settles in. EMT availability is thin and Spanish-first households lack updates.",
  incidentType: "climate",
  location: "San Jose Civic Core",
  population: 4200,
  hoursToImpact: 6,
  severity: 4,
  commsChannels: ["SMS", "Radio", "CERT"],
};

const seedPlan: PulsePlan = {
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

const channelOptions = ["SMS", "Email", "Push", "CERT", "Radio", "Social"];

export default function Home() {
  const [brief, setBrief] = useState<Brief>(defaultBrief);
  const [draftPlan, setDraftPlan] = useState<PulsePlan>(seedPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const momentumScore = useMemo(() => {
    const severityWeight = brief.severity * 5;
    const timeWeight = Math.max(0, 50 - brief.hoursToImpact * 4);
    const popWeight = Math.min(50, Math.log(brief.population + 1) * 4);
    return Math.min(100, Math.round(40 + severityWeight + (timeWeight + popWeight) / 2));
  }, [brief]);

  const readinessDelta = draftPlan.confidence - 50;

  const toggleChannel = (channel: string) => {
    setBrief((prev) => {
      const exists = prev.commsChannels.includes(channel);
      return {
        ...prev,
        commsChannels: exists
          ? prev.commsChannels.filter((c) => c !== channel)
          : [...prev.commsChannels, channel],
      };
    });
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setAiError(null);

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brief),
      });

      if (!response.ok) {
        throw new Error("Plan generation failed");
      }

      const data = (await response.json()) as PulsePlan;
      setDraftPlan(data);
    } catch (error) {
      console.error(error);
      setAiError("Live plan failed, showing resilient template.");
      setDraftPlan(seedPlan);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 backdrop-blur lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-lime-300 bg-lime-50 text-lime-900">
              TreeHacks 2026 · Civic Resilience
            </Badge>
            <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-900">
              Live pipeline ready
            </Badge>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                PulseMesh: AI ops desk for neighborhoods under pressure
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                Fuse raw community reports, infrastructure signals, and AI reasoning into a single
                tactical brief your city can act on in minutes—not hours.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1 font-medium">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Synthetic responders onboarded
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-4 py-1 font-medium">
                  <Radio className="h-4 w-4 text-blue-500" /> Dispatch API ready
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-6 py-4 text-slate-50 shadow-lg shadow-slate-900/30">
              <span className="text-sm uppercase tracking-widest text-slate-300">Ops Momentum</span>
              <span className="text-5xl font-bold">{momentumScore}</span>
              <p className="text-sm text-slate-300">
                Weighted by severity, impact clock, and populations touched.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200 shadow-md shadow-slate-200/60">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">Live incident brief</CardTitle>
                  <CardDescription>
                    Describe what you see on the ground. PulseMesh normalizes the chaos.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  Level {brief.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="scenario">Incident snapshot</Label>
                  <Textarea
                    id="scenario"
                    rows={4}
                    value={brief.scenario}
                    onChange={(event) =>
                      setBrief((prev) => ({ ...prev, scenario: event.target.value }))
                    }
                    className="min-h-[140px] bg-white"
                    placeholder="What is unfolding? Where are the bottlenecks?"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Incident type</Label>
                    <Select
                      value={brief.incidentType}
                      onValueChange={(value: Brief["incidentType"]) =>
                        setBrief((prev) => ({ ...prev, incidentType: value }))
                      }
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="climate">Climate & heat</SelectItem>
                        <SelectItem value="health">Public health</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Hotspot location</Label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="location"
                        className="pl-9"
                        value={brief.location}
                        onChange={(event) =>
                          setBrief((prev) => ({ ...prev, location: event.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FieldStat
                    label="Hours to impact"
                    value={brief.hoursToImpact}
                    suffix="hrs"
                    onChange={(value) =>
                      setBrief((prev) => ({ ...prev, hoursToImpact: Number(value) }))
                    }
                  />
                  <FieldStat
                    label="Population exposed"
                    value={brief.population}
                    suffix="residents"
                    onChange={(value) =>
                      setBrief((prev) => ({ ...prev, population: Number(value) }))
                    }
                  />
                  <div className="space-y-2">
                    <Label>Severity level</Label>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>Steady</span>
                        <span>Critical</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        value={brief.severity}
                        onChange={(event) =>
                          setBrief((prev) => ({
                            ...prev,
                            severity: Number(event.target.value),
                          }))
                        }
                        className="mt-4 w-full accent-slate-900"
                      />
                      <p className="mt-2 text-center text-sm font-semibold text-slate-700">
                        Level {brief.severity}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Channels already activated</Label>
                  <div className="flex flex-wrap gap-3">
                    {channelOptions.map((channel) => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={cn(
                          "rounded-full border px-4 py-1 text-sm font-medium transition",
                          brief.commsChannels.includes(channel)
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {channel}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full gap-2 bg-slate-900 text-base font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Synthesizing playbook…" : "Generate operational playbook"}
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                {aiError && <p className="text-sm text-amber-600">{aiError}</p>}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-slate-900 text-slate-50 shadow-xl shadow-slate-900/30">
              <CardHeader>
                <CardTitle className="text-2xl">AI fused brief</CardTitle>
                <CardDescription className="text-slate-300">
                  Cross-validated with infrastructure feeds + past incidents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg leading-relaxed text-slate-100">{draftPlan.summary}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {draftPlan.signalThemes.map((theme) => (
                    <div
                      key={theme}
                      className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-200"
                    >
                      {theme}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Coordination confidence</span>
                    <span>{draftPlan.confidence}%</span>
                  </div>
                  <Progress value={draftPlan.confidence} className="mt-2 h-2 bg-white/20" />
                  <p className="mt-2 text-sm text-slate-300">
                    Momentum delta {readinessDelta >= 0 ? "+" : ""}
                    {readinessDelta} vs. yesterday&apos;s baseline.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>Timeline of record</CardTitle>
                  <Badge variant="outline">Auto-updates in real time</Badge>
                </div>
                <CardDescription>Phases map directly to your ICS board.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {draftPlan.timeline.map((item) => (
                  <div key={item.phase}>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span className="font-semibold text-slate-900">{item.phase}</span>
                      <span>{item.window}</span>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      {item.tasks.map((task) => (
                        <li key={task} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 flex-none rounded-full bg-slate-900" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    <Separator className="my-6" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Resource pulse</CardTitle>
                <CardDescription>Where you need to escalate partners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {draftPlan.resourceGaps.map((gap) => (
                  <div
                    key={gap.asset}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{gap.asset}</p>
                      <p className="text-sm text-slate-500">
                        {gap.owner} · {gap.impact}
                      </p>
                    </div>
                    <StatusPill status={gap.status} />
                  </div>
                ))}
                <Separator />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Comms pushes</p>
                  <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-600">
                    {draftPlan.commsAngles.map((angle) => (
                      <li key={angle}>{angle}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

type FieldStatProps = {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
};

function FieldStat({ label, value, suffix, onChange }: FieldStatProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-2xl font-semibold text-slate-900">
          {value.toLocaleString()} {suffix && <span className="text-base text-slate-500">{suffix}</span>}
        </p>
        <Input
          type="number"
          min={0}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-3 bg-white"
        />
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ResourceGap["status"] }) {
  const colors: Record<ResourceGap["status"], string> = {
    ready: "bg-emerald-50 text-emerald-700 border-emerald-100",
    lagging: "bg-amber-50 text-amber-700 border-amber-100",
    blocked: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold capitalize",
        colors[status]
      )}
    >
      {status}
    </span>
  );
}
