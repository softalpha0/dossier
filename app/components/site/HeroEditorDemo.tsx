import { IconCheck, IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const LIMIT = 250;
const STEPS = [
  { words: 371, voice: 54, caption: "First draft: 121 words over, and it opens with a stock phrase." },
  { words: 371, voice: 54, caption: "The voice check flags the sentence and proposes a rewrite from your own story." },
  { words: 248, voice: 86, caption: "You accept three suggestions. It's within the limit and sounds like you." },
] as const;

const FLAGGED =
  "I am passionate about making a difference in my community, and I have always been driven by a desire to help others.";
const REWRITE = "In the winter of 2023, our neighbourhood clinic ran out of rapid flu test kits.";

function useTween(target: number, ms = 900) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    if (a === target) return;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(a + (target - a) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else from.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target, ms]);
  return value;
}

/** The product's core moment, as a looping, pausable illustration of the answer editor. */
export function HeroEditorDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPlaying(false);
      setStep(1);
    }
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), step === 2 ? 4600 : 3200);
    return () => clearTimeout(t);
  }, [step, playing]);

  const current = STEPS[step]!;
  const words = useTween(current.words);
  const voice = useTween(current.voice);
  const over = words > LIMIT;

  return (
    <figure className="relative">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_1px_0_hsl(var(--border)),0_24px_60px_-28px_hsl(var(--foreground)/0.28)]">
        {/* window bar */}
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5 text-xs text-muted-foreground">
          <span className="truncate">Harbor Leaders Scholarship · Question 1</span>
          <span className="shrink-0 rounded-full border px-2 py-0.5">Saved</span>
        </div>

        <div className="grid md:grid-cols-[1fr_15rem]">
          {/* editor */}
          <div className="p-5 sm:p-6">
            <p className="dossier-serif text-lg leading-snug sm:text-xl">
              Describe a time you led change in your community.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums">
              <span className={cn("font-medium transition-colors", over ? "text-red-700 dark:text-red-400" : "text-primary")}>
                {words} / {LIMIT} words
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                  over
                    ? "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300"
                    : "bg-primary/10 text-primary",
                )}
              >
                {over ? `${words - LIMIT} over the limit` : "Within the limit"}
              </span>
            </div>

            <div className="dossier-serif relative mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90 sm:text-base">
              <p>
                {step < 2 ? (
                  <span className={cn(step === 1 && "dossier-flag", "transition-colors")}>{FLAGGED}</span>
                ) : (
                  <span className="rounded bg-primary/10 px-0.5 text-foreground">{REWRITE}</span>
                )}{" "}
                {step < 2 ? (
                  <span className="text-foreground/60">In today's fast-paced world, healthcare is more important than ever…</span>
                ) : null}
              </p>
              <p className="text-foreground/75">
                People were being sent home with fevers, untested. I organised 40 volunteers from my sports club and my
                old school, started a WhatsApp donation drive, then drove to a regional supplier twice to collect the
                donated kits.
              </p>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
            </div>
          </div>

          {/* suggestion rail */}
          <div className="border-t bg-muted/30 p-5 md:border-l md:border-t-0">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sounds like you</p>
              <p className="text-sm font-semibold tabular-nums">{voice}/100</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-[var(--dossier-chart)] transition-[width] duration-700 ease-out"
                style={{ width: `${voice}%` }}
              />
            </div>

            <div
              className={cn(
                "mt-5 rounded-lg border bg-card p-3 text-sm transition-all duration-500",
                step === 0 ? "translate-y-1 opacity-40" : "opacity-100",
              )}
            >
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">May sound generic</p>
              <p className="mt-1.5 text-muted-foreground line-through decoration-muted-foreground/50">I am passionate about making a difference…</p>
              <p className="mt-1 text-foreground">In the winter of 2023, our neighbourhood clinic…</p>
              <p className="mt-2 text-xs text-muted-foreground">Open with what happened. Facts from your story only.</p>
              <div className="mt-3 flex gap-2" aria-hidden="true">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    step === 2 ? "bg-primary text-primary-foreground" : "border bg-background",
                  )}
                >
                  <IconCheck className="size-3.5" /> {step === 2 ? "Accepted" : "Accept"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <IconX className="size-3.5" /> Reject
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 flex items-start justify-between gap-4 text-sm text-muted-foreground">
        <span aria-live="polite" className="min-h-10">
          <span className="mr-2 font-medium tabular-nums text-foreground">{step + 1}/3</span>
          {current.caption}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show step ${i + 1}`}
              aria-current={i === step}
              onClick={() => {
                setStep(i);
                setPlaying(false);
              }}
              className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-foreground" : "w-1.5 bg-foreground/25 hover:bg-foreground/50")}
            />
          ))}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the demo" : "Play the demo"}
            className="ml-1 rounded-md p-1 hover:bg-muted"
          >
            {playing ? <IconPlayerPause className="size-4" /> : <IconPlayerPlay className="size-4" />}
          </button>
        </span>
      </figcaption>
    </figure>
  );
}
