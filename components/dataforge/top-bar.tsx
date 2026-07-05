"use client"

import { TARGET_FORMATS, type TargetFormat } from "@/lib/forge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronsUpDown, FileJson, Sparkles, Zap } from "lucide-react"

export function TopBar({
  fileName,
  target,
  onTargetChange,
  validationMode,
  onValidationChange,
  onConvert,
  busy,
}: {
  fileName: string
  target: TargetFormat
  onTargetChange: (t: TargetFormat) => void
  validationMode: boolean
  onValidationChange: (v: boolean) => void
  onConvert: () => void
  busy: boolean
}) {
  const current = TARGET_FORMATS.find((f) => f.id === target)!

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <FileJson className="h-4 w-4 text-primary" />
        <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
        <span className="hidden text-xs text-muted-foreground sm:inline">JSON source</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Validation</span>
          <Switch checked={validationMode} onCheckedChange={onValidationChange} aria-label="Toggle validation mode" />
          <span className="w-6 text-[11px] font-semibold text-muted-foreground">
            {validationMode ? "On" : "Off"}
          </span>
        </label>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <span className="text-xs text-muted-foreground">Format</span>
              {current.label}
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Convert to</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TARGET_FORMATS.map((f) => (
              <DropdownMenuItem key={f.id} onSelect={() => onTargetChange(f.id)} className="justify-between">
                <span>{f.label}</span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">.{f.ext}</span>
                  {f.id === target && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button onClick={onConvert} disabled={busy} className="h-9 gap-2 px-4 font-medium">
          <Zap className="h-4 w-4" />
          Convert
        </Button>
      </div>
    </header>
  )
}
