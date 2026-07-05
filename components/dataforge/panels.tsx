"use client"

import type { ValidationResult } from "@/lib/forge"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle2, Clock, FileJson, Hash, Layers, ShieldCheck } from "lucide-react"

/* --------------------------------- Recent --------------------------------- */

const RECENTS = [
  { name: "users.json", size: "4.2 KB", when: "2 min ago", target: "TypeScript" },
  { name: "orders.json", size: "18.9 KB", when: "1 hour ago", target: "SQL" },
  { name: "metrics.json", size: "902 B", when: "Yesterday", target: "CSV" },
  { name: "config.json", size: "1.1 KB", when: "2 days ago", target: "JSON" },
]

export function RecentPanel({ onOpen }: { onOpen?: (name: string) => void }) {
  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <PanelTitle icon={Clock} title="Recent files" subtitle="Your latest conversions, stored locally on this device." />
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {RECENTS.map((r) => (
          <li key={r.name}>
            <button
              type="button"
              onClick={() => onOpen?.(r.name)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
            >
              <FileJson className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{r.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {r.size} · {r.when}
                </span>
              </span>
              <span className="rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground">
                → {r.target}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------- Validator ------------------------------- */

export function ValidatorReport({ validation }: { validation: ValidationResult }) {
  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <PanelTitle icon={ShieldCheck} title="Schema validator" subtitle="Real-time structural analysis of your JSON input." />

      <div
        className={cn(
          "mt-6 flex items-center gap-3 rounded-xl border px-4 py-4",
          validation.valid ? "border-syntax-string/30 bg-syntax-string/10" : "border-destructive/30 bg-destructive/10",
        )}
      >
        {validation.valid ? (
          <CheckCircle2 className="h-6 w-6 text-syntax-string" />
        ) : (
          <AlertTriangle className="h-6 w-6 text-destructive" />
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">
            {validation.valid ? "Document is valid" : "Document has errors"}
          </p>
          <p className="text-xs text-muted-foreground">
            {validation.valid
              ? "No structural issues detected."
              : `${validation.issues.length} issue${validation.issues.length > 1 ? "s" : ""} found.`}
          </p>
        </div>
      </div>

      {!validation.valid && (
        <ul className="mt-4 space-y-2">
          {validation.issues.map((issue, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <span className="mt-0.5 rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[11px] text-destructive">
                {issue.line}:{issue.column}
              </span>
              <span className="text-sm text-foreground">{issue.message}</span>
            </li>
          ))}
        </ul>
      )}

      {validation.valid && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={Hash} label="Keys" value={validation.stats.keys} />
          <Stat icon={Layers} label="Depth" value={validation.stats.depth} />
          <Stat icon={Layers} label="Nodes" value={validation.stats.nodes} />
          <Stat icon={FileJson} label="Bytes" value={validation.stats.bytes} />
        </div>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Hash; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

/* -------------------------------- Settings -------------------------------- */

export function SettingsPanel({
  validationMode,
  onValidationChange,
  wordWrap,
  onWordWrapChange,
}: {
  validationMode: boolean
  onValidationChange: (v: boolean) => void
  wordWrap: boolean
  onWordWrapChange: (v: boolean) => void
}) {
  return (
    <div className="mx-auto w-full max-w-2xl p-8">
      <PanelTitle icon={FileJson} title="Settings" subtitle="Preferences are stored locally. DataForge works fully offline." />
      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        <ToggleRow
          title="Validation mode"
          description="Continuously validate input as you type."
          checked={validationMode}
          onChange={onValidationChange}
        />
        <ToggleRow
          title="Word wrap"
          description="Wrap long lines in the editor panels."
          checked={wordWrap}
          onChange={onWordWrapChange}
        />
        <ToggleRow title="Offline-first" description="All processing happens on-device." checked disabled onChange={() => {}} />
      </div>
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60",
          checked ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  )
}

function PanelTitle({ icon: Icon, title, subtitle }: { icon: typeof Hash; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}
