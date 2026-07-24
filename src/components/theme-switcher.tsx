"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "aman", label: "Aman" },
  { id: "bambu", label: "Bambu" },
  { id: "chanel", label: "Chanel" },
] as const;

type DesignSystemSection = readonly [id: string, label: string, number: string];

const SECTION_GROUPS: readonly { id: string; label: string; sections: readonly DesignSystemSection[] }[] = [
  { id: "foundations", label: "Foundations", sections: [["principles", "Principles", "01"], ["comparison", "Palettes", "02"], ["colour", "Colour", "03"], ["typography", "Type", "04"], ["identity", "Identity", "05"], ["layout", "Layout", "06"]] },
  { id: "components-group", label: "Components", sections: [["buttons", "Buttons", "07"], ["lists", "Lists", "08"], ["filters", "Search & filters", "09"], ["cards", "Cards", "10"], ["forms", "Forms", "11"], ["states", "States", "12"]] },
  { id: "compositions", label: "Compositions", sections: [["navigation", "Navigation", "13"], ["page-headers", "Page headers", "14"], ["editorial-content", "Editorial content", "15"], ["enquiry-patterns", "Enquiry patterns", "16"], ["overlays-feedback", "Overlays & feedback", "17"]] },
  { id: "editorial-group", label: "Editorial", sections: [["imagery", "Imagery", "18"], ["voice", "Voice", "19"]] },
];

const SECTIONS = SECTION_GROUPS.flatMap((group) => group.sections);

type ThemeId = (typeof THEMES)[number]["id"];
type Setting = "type" | "corners" | "density" | "accent";

const isTheme = (value: string | null): value is ThemeId =>
  THEMES.some((theme) => theme.id === value);

export function DesignSystemToolbar() {
  const [theme, setTheme] = useState<ThemeId>("aman");
  const [hasRestoredTheme, setHasRestoredTheme] = useState(false);
  const [settings, setSettings] = useState({ type: "editorial", corners: "restrained", density: "editorial", accent: "quiet" });
  const [active, setActive] = useState("principles");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ foundations: true, "components-group": true, compositions: true, "editorial-group": true });

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("solas-theme");
      if (isTheme(stored)) setTheme(stored);
      setHasRestoredTheme(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hasRestoredTheme) return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    Object.entries(settings).forEach(([key, value]) => { root.dataset[key] = value; });
    window.localStorage.setItem("solas-theme", theme);
  }, [theme, settings, hasRestoredTheme]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActive(entry.target.id)),
      { rootMargin: "-20% 0px -70%", threshold: 0 },
    );
    SECTIONS.forEach(([id]) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  function update(key: Setting, value: string) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setTheme("aman");
    setSettings({ type: "editorial", corners: "restrained", density: "editorial", accent: "quiet" });
  }

  return (
    <>
      <aside className={cn("sticky top-0 z-40 hidden h-svh shrink-0 border-r border-border bg-background transition-[width] duration-200 lg:block", sidebarCollapsed ? "w-16" : "w-64")}>
        <div className="flex h-full flex-col">
          <div className={cn("flex h-20 items-center border-b border-border", sidebarCollapsed ? "justify-center px-2" : "justify-between px-5")}>
            {!sidebarCollapsed && <div><p className="font-display text-lg">The Solas Guide</p><p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Design system</p></div>}
            <button type="button" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expand design system sidebar" : "Collapse design system sidebar"} className="grid size-9 place-items-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            </button>
          </div>
          <nav aria-label="Design system sections" className="flex-1 overflow-y-auto px-2 py-4">
            {sidebarCollapsed ? (
              <div className="grid gap-1">
                {SECTIONS.map(([id, label, number]) => <a key={id} href={`#${id}`} title={label} aria-label={`${number} ${label}`} className={cn("grid h-10 place-items-center border-l-2 text-[10px] font-medium tracking-[0.08em] transition-colors", active === id ? "border-accent bg-muted text-foreground" : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>{number}</a>)}
              </div>
            ) : SECTION_GROUPS.map((group) => {
              const isOpen = openGroups[group.id];
              return <div key={group.id} className="mb-3">
                <button type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.id]: !isOpen }))} aria-expanded={isOpen} className="flex w-full items-center justify-between px-3 py-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
                  {group.label}<ChevronDown className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")} />
                </button>
                {isOpen && <div className="grid gap-0.5">{group.sections.map(([id, label, number]) => {
                  return <a key={id} href={`#${id}`} className={cn("flex items-center gap-3 border-l-2 px-3 py-2.5 text-xs transition-colors", active === id ? "border-accent bg-muted text-foreground" : "border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground")}><span className="w-7 text-[9px] tabular-nums opacity-55">{number}</span>{label}</a>;
                })}</div>}
              </div>;
            })}
          </nav>
          {!sidebarCollapsed && <div className="border-t border-border p-5"><p className="text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Agent reference</p><p className="mt-2 break-words font-mono text-[10px] leading-relaxed text-foreground/70">docs/design-system-agent-reference.md</p></div>}
        </div>
      </aside>

      <nav aria-label="Design system sections" className="sticky top-0 z-40 border-y border-border bg-background/92 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center px-4 md:px-6">
          <button type="button" className="flex w-full items-center justify-between py-3 text-xs font-medium uppercase tracking-[0.18em]" onClick={() => setNavOpen(!navOpen)} aria-expanded={navOpen}>
            <span>{SECTIONS.find(([id]) => id === active)?.[1]}</span><Menu className="size-4" />
          </button>
        </div>
        {navOpen && <div className="grid grid-cols-2 border-t border-border bg-background p-3">{SECTIONS.map(([id, label, number]) => <a key={id} href={`#${id}`} onClick={() => setNavOpen(false)} className={cn("px-3 py-3 text-xs", active === id ? "bg-muted text-foreground" : "text-muted-foreground")}><span className="mr-2 text-[9px] opacity-50">{number}</span>{label}</a>)}</div>}
      </nav>

      <div className="fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6">
        {controlsOpen && <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] border border-border bg-popover p-5 shadow-2xl">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.2em]">Review controls</p><p className="mt-1 text-xs text-muted-foreground">Experiment without changing the source system.</p></div><button type="button" onClick={() => setControlsOpen(false)} aria-label="Close review controls"><X className="size-4" /></button></div>
          <Control label="Theme" value={theme} options={THEMES.map(({ id, label }) => [id, label])} onChange={(value) => setTheme(value as ThemeId)} />
          <Control label="Typography" value={settings.type} options={[["editorial", "Editorial"], ["classical", "Classical"], ["modern", "Modern"]]} onChange={(value) => update("type", value)} />
          <Control label="Corners" value={settings.corners} options={[["square", "Square"], ["restrained", "Restrained"], ["soft", "Soft"]]} onChange={(value) => update("corners", value)} />
          <Control label="Density" value={settings.density} options={[["editorial", "Editorial"], ["compact", "Compact"]]} onChange={(value) => update("density", value)} />
          <Control label="Accent" value={settings.accent} options={[["quiet", "Quiet"], ["expressive", "Expressive"]]} onChange={(value) => update("accent", value)} />
          <button type="button" onClick={reset} className="mt-5 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><RotateCcw className="size-3.5" />Reset to Aman</button>
        </div>}
        <button type="button" onClick={() => setControlsOpen(!controlsOpen)} aria-expanded={controlsOpen} className="ml-auto flex items-center gap-2 bg-primary px-4 py-3 text-xs font-medium uppercase tracking-[0.15em] text-primary-foreground shadow-lg"><SlidersHorizontal className="size-4" />Review controls</button>
      </div>
    </>
  );
}

export function DesignReviewControl() {
  const [theme, setTheme] = useState<ThemeId>("aman");
  const [hasRestoredTheme, setHasRestoredTheme] = useState(false);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const stored = window.localStorage.getItem("solas-theme");
      if (isTheme(stored)) setTheme(stored);
      setHasRestoredTheme(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (!hasRestoredTheme) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("solas-theme", theme);
  }, [theme, hasRestoredTheme]);

  return <div className="fixed right-4 bottom-4 z-50 flex items-center gap-1 border border-border bg-background p-1 shadow-lg" aria-label="Theme review controls">
    <span className="px-2 text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Review</span>
    {THEMES.map((item) => <button key={item.id} type="button" aria-pressed={theme === item.id} onClick={() => setTheme(item.id)} className={cn("flex items-center gap-1.5 px-2.5 py-2 text-[10px] uppercase tracking-[0.12em] transition-colors", theme === item.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span>{item.label}</span>{theme === item.id && <Check className="size-3" />}</button>)}
  </div>;
}

function Control({ label, value, options, onChange }: { label: string; value: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <fieldset className="mb-4"><legend className="mb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</legend><div className="flex flex-wrap gap-1">{options.map(([id, text]) => <button key={id} type="button" onClick={() => onChange(id)} aria-pressed={value === id} className={cn("flex items-center gap-1.5 border px-2.5 py-1.5 text-xs", value === id ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground/50")}>{value === id && <Check className="size-3" />}{text}</button>)}</div></fieldset>;
}
