"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PlanResponse = {
  mission: { title: string; detail: string }[];
  resources: { name: string; available: number; needed: number; note?: string }[];
  risks: { label: string; level: string; action: string }[];
  comms: string;
  metrics: {
    lifeSafety: number;
    lifelines: string;
    intelLatency: string;
  };
};

const samplePlan: PlanResponse = {
  mission: [
    {
      title: "Golden Hour (0-4h)",
      detail:
        "Stabilize clinics, deploy mobile triage, sync with county EOC.",
    },
    {
      title: "Operational (4-24h)",
      detail:
        "Spin up pop-up shelter at Jefferson HS, request USDA meals, push SMS blast.",
    },
    {
      title: "Sustain (24-72h)",
      detail:
        "Water relay using fire dept tankers, secure 20 nurses via Medical Reserve Corps.",
    },
  ],
  resources: [
    { name: "Med kits", available: 180, needed: 220, note: "Pull cached pallets from Station 17." },
    { name: "Potable water (gal)", available: 3200, needed: 6000, note: "Leverage breweries for canning line." },
    { name: "Generators", available: 6, needed: 4, note: "Share surplus with Eastside warming center." },
  ],
  risks: [
    {
      label: "Cold Exposure",
      level: "high",
      action: "Bus partner shelters, distribute 500 thermal blankets.",
    },
    {
      label: "Power Instability",
      level: "medium",
      action: "Microgrid handshake with PG&E, stage battery trailers.",
    },
    {
      label: "Misinformation",
      level: "watch",
      action: "Daily mayor video brief, multi-language rumor rebuttals.",
    },
  ],
  comms:
    "Situation: Atmospheric river flooded 12 blocks, 18k customers without power. Ask: deploy sandbag teams + mental health strike team. CTA: Volunteers report to Makerspace hub by 14:30.",
  metrics: {
    lifeSafety: 84,
    lifelines: "Orange",
    intelLatency: "8m",
  },
};

const levelColors: Record<string, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  watch: "bg-sky-100 text-sky-700",
};

export function OpsWeaverDashboard() {
  const [scenario, setScenario] = useState(
    "Atmospheric river flooded South Bay homes after levee breach."
  );
  const [location, setLocation] = useState("San Jose, CA");
  const [assets, setAssets] = useState(
    "2 mobile clinics, 40 CERT volunteers, 6 box trucks, 12 pallets water."
  );
  const [timebox, setTimebox] = useState("72");
  const [plan, setPlan] = useState<PlanResponse>(samplePlan);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("Awaiting fresh intel");
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("opsweaver-board");
      if (!stored) return;
      const parsed = JSON.parse(stored) as {
        scenario: string;
        location: string;
        assets: string;
        timebox: string;
        plan: PlanResponse;
        lastSynced?: string | null;
      };
      setScenario(parsed.scenario);
      setLocation(parsed.location);
      setAssets(parsed.assets);
      setTimebox(parsed.timebox);
      setPlan(parsed.plan);
      setLastSynced(parsed.lastSynced ?? null);
      setStatusMessage("Reloaded last mission thread.");
    } catch (error) {
      console.error("Failed to restore OpsWeaver state", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "opsweaver-board",
      JSON.stringify({ scenario, location, assets, timebox, plan, lastSynced })
    );
  }, [scenario, location, assets, timebox, plan, lastSynced]);

  const handlePlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setStatusMessage("Syncing ground truth with FEMA playbooks…");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          location,
          assets,
          timebox: Number(timebox),
        }),
      });
      if (!response.ok) {
        throw new Error("AI planner unavailable, try again shortly.");
      }
      const data = (await response.json()) as { plan: PlanResponse };
      setPlan(data.plan);
      setStatus("success");
      setStatusMessage("Mission thread refreshed.");
      setLastSynced(new Date().toISOString());
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Something went sideways."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e1f0ff,transparent_60%),#f9fafb] text-zinc-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <header className="rounded-3xl border border-white/60 bg-white/80 p-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900/5 px-3 py-1 text-sm font-semibold uppercase tracking-widest text-zinc-600">
            OpsWeaver • Crisis Operating Picture
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-semibold leading-tight text-zinc-950 lg:text-5xl">
                Turn chaotic field updates into a live, decision-ready board in
                seconds.
              </h1>
              <p className="mt-4 text-lg text-zinc-600">
                OpsWeaver ingests situation blurbs, cross-checks logistics rules
                of thumb, and broadcasts a synchronized plan your responders can
                execute immediately.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-inner">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                Live Signal
              </p>
              <p className="mt-2 text-3xl font-semibold">
                {status === "loading"
                  ? "Calculating"
                  : `${plan.metrics.lifeSafety.toFixed(0)}%`}
              </p>
              <p className="text-sm text-zinc-500">
                Median life-safety confidence after last sync.
              </p>
              <div className="mt-4 h-1.5 rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${plan.metrics.lifeSafety}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                {lastSynced
                  ? `Last synced ${new Date(lastSynced).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Awaiting first sync"}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <Card className="border-zinc-100/80 bg-white/80 shadow-lg shadow-sky-200/30">
            <CardHeader>
              <CardTitle>Describe the ground truth</CardTitle>
              <CardDescription>
                OpsWeaver aligns local intel, resource constraints, and
                political realities into one mission thread.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handlePlan}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">
                    Situation overview
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-emerald-400 focus:outline-none"
                    value={scenario}
                    onChange={(event) => setScenario(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">
                      Impact zone
                    </label>
                    <Input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-700">
                      Planning horizon (hours)
                    </label>
                    <Input
                      type="number"
                      min={6}
                      max={120}
                      value={timebox}
                      onChange={(event) => setTimebox(event.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">
                    Assets & gaps
                  </label>
                  <textarea
                    className="min-h-[90px] w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm shadow-inner focus:border-emerald-400 focus:outline-none"
                    value={assets}
                    onChange={(event) => setAssets(event.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium",
                      status === "error"
                        ? "bg-rose-50 text-rose-600"
                        : status === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-zinc-50 text-zinc-500"
                    )}
                  >
                    {statusMessage}
                  </div>
                  <Button
                    type="submit"
                    className="h-12 rounded-2xl text-base font-semibold"
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? (
                      <span className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Spinning mission thread…
                      </span>
                    ) : (
                      "Spin up mission thread"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card className="border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Decision snapshot</CardTitle>
                <CardDescription className="text-white/80">
                  Auto-generated once you sync fresh intel.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/70">
                    Life safety
                  </p>
                  <p className="text-3xl font-bold">
                    {plan.metrics.lifeSafety.toFixed(0)}%
                  </p>
                  <p className="text-xs text-white/70">
                    Critical evac confidence
                  </p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/70">
                    Lifelines
                  </p>
                  <p className="text-3xl font-bold">{plan.metrics.lifelines}</p>
                  <p className="text-xs text-white/70">Energy & water status</p>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-widest text-white/70">
                    Intel latency
                  </p>
                  <p className="text-3xl font-bold">
                    {plan.metrics.intelLatency}
                  </p>
                  <p className="text-xs text-white/70">
                    Last SITREP ingest
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-zinc-100/60 bg-white/90 shadow-lg">
              <CardHeader>
                <CardTitle>Planned mission thread</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.mission.map((phase) => (
                  <div
                    key={phase.title}
                    className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      {phase.title}
                    </div>
                    <p className="mt-1 text-sm text-zinc-700">{phase.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-zinc-100 bg-white/80 shadow-md">
            <CardHeader>
              <CardTitle>Resource pulse</CardTitle>
              <CardDescription>
                Immediate fill recommendations based on FEMA playbooks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.resources.map((item) => {
                const delta = item.available - item.needed;
                const status = delta >= 0 ? "surplus" : "gap";
                const ratio = Math.min(
                  100,
                  Math.round((item.available / item.needed) * 100)
                );
                return (
                  <div key={item.name} className="rounded-2xl border border-zinc-100 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <p>{item.name}</p>
                      <span
                        className={cn(
                          "rounded-full px-3 py-0.5 text-xs uppercase tracking-wide",
                          status === "surplus"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-zinc-500">
                      Available {item.available.toLocaleString()} / Needed{" "}
                      {item.needed.toLocaleString()}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-zinc-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          status === "surplus"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        )}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    {item.note ? (
                      <p className="mt-2 text-xs text-zinc-500">{item.note}</p>
                    ) : null}
                  </div>
                );
              })}
            </CardContent>
          </Card>
          <Card className="border-zinc-100 bg-white/80 shadow-md">
            <CardHeader>
              <CardTitle>Risk radar</CardTitle>
              <CardDescription>
                Color-coded guardrails for command staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.risks.map((risk) => (
                <div
                  key={risk.label}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-zinc-100 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold">{risk.label}</p>
                    <p className="text-xs text-zinc-500">{risk.action}</p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                      levelColors[risk.level] ?? "bg-zinc-100 text-zinc-700"
                    )}
                  >
                    {risk.level}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <Card className="border-zinc-100 bg-white/90 shadow-md">
          <CardHeader>
            <CardTitle>Comms kit</CardTitle>
            <CardDescription>
              Drop into your EOC log, email blast, or public post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-3xl border border-zinc-100 bg-zinc-50/80 p-6 text-sm text-zinc-700">
              {plan.comms}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
