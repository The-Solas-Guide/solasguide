"use client";

import { Check, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "aman", label: "Aman" },
  { id: "bambu", label: "Bambu" },
  { id: "chanel", label: "Chanel" },
  { id: "solas", label: "Solas" },
] as const;

type ThemeId = (typeof THEMES)[number]["id"];
type Settings = {
  type: "editorial" | "classical" | "modern";
  corners: "restrained" | "square" | "soft";
  density: "editorial" | "compact";
  accent: "quiet" | "expressive";
};

const DEFAULT_SETTINGS: Settings = {
  type: "editorial",
  corners: "restrained",
  density: "editorial",
  accent: "quiet",
};

const isTheme = (value: string | null): value is ThemeId =>
  THEMES.some((theme) => theme.id === value);

export function ThemeReviewControl({
  full = false,
  defaultOpen = false,
}: {
  full?: boolean;
  defaultOpen?: boolean;
}) {
  const [theme, setTheme] = useState<ThemeId>("aman");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [open, setOpen] = useState(defaultOpen);
  const [hasRestoredTheme, setHasRestoredTheme] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem("solas-review-theme");
        if (isTheme(stored)) setTheme(stored);
      } catch {
        // The review remains functional when browser storage is unavailable.
      }
      setHasRestoredTheme(true);
    }, 0);

    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hasRestoredTheme) return;

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.type = settings.type;
    root.dataset.corners = settings.corners;
    root.dataset.density = settings.density;
    root.dataset.accent = settings.accent;

    try {
      window.localStorage.setItem("solas-review-theme", theme);
    } catch {
      // Theme persistence is optional; the controls still work in-memory.
    }

    return () => {
      delete root.dataset.type;
      delete root.dataset.corners;
      delete root.dataset.density;
      delete root.dataset.accent;
    };
  }, [hasRestoredTheme, settings, theme]);

  function reset() {
    setTheme("aman");
    setSettings(DEFAULT_SETTINGS);
  }

  return (
    <aside className="fixed right-3 bottom-3 z-50 md:right-6 md:bottom-6" aria-label="Design review controls">
      {open && (
        <div className="mb-2 w-[min(23rem,calc(100vw-1.5rem))] border border-border bg-popover p-5 text-popover-foreground shadow-2xl">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="review-label">Review controls</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Compare the same page across four candidate visual registers.
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close review controls">
              <X className="size-4" />
            </button>
          </div>
          <Control
            label="Theme"
            value={theme}
            options={THEMES.map(({ id, label }) => [id, label])}
            onChange={(value) => setTheme(value as ThemeId)}
          />
          {full && (
            <>
              <Control label="Typography" value={settings.type} options={[["editorial", "Editorial"], ["classical", "Classical"], ["modern", "Modern"]]} onChange={(value) => setSettings((current) => ({ ...current, type: value as Settings["type"] }))} />
              <Control label="Corners" value={settings.corners} options={[["restrained", "Restrained"], ["square", "Square"], ["soft", "Soft"]]} onChange={(value) => setSettings((current) => ({ ...current, corners: value as Settings["corners"] }))} />
              <Control label="Density" value={settings.density} options={[["editorial", "Editorial"], ["compact", "Compact"]]} onChange={(value) => setSettings((current) => ({ ...current, density: value as Settings["density"] }))} />
              <Control label="Accent" value={settings.accent} options={[["quiet", "Quiet"], ["expressive", "Expressive"]]} onChange={(value) => setSettings((current) => ({ ...current, accent: value as Settings["accent"] }))} />
            </>
          )}
          <button type="button" onClick={reset} className="mt-5 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="size-3.5" /> Reset review controls
          </button>
        </div>
      )}
      <div className="ml-auto flex w-fit items-center border border-border bg-background p-1 shadow-xl">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="grid size-10 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Toggle design review controls"
        >
          <SlidersHorizontal className="size-4" />
        </button>
        {THEMES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={theme === item.id}
            onClick={() => setTheme(item.id)}
            className={cn(
              "hidden min-h-10 items-center gap-1.5 px-2.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] transition-colors sm:flex",
              theme === item.id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
            {theme === item.id && <Check className="size-3" />}
          </button>
        ))}
      </div>
    </aside>
  );
}

function Control({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-5">
      <legend className="review-label mb-2 text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={value === id}
            className={cn(
              "border px-2.5 py-2 text-xs",
              value === id
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/45",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
