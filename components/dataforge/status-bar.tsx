"use client"

import { cn } from "@/lib/utils"
import { Check, Copy, Loader2 } from "lucide-react"

export type StatusKind = "ready" | "working" | "error" | "done"

export function StatusBar({
  status,
  message,
  progress,
  lines,
  chars,
  target,
  copied,
  onCopy,
  canCopy,
}: {
  status: StatusKind
  message: string
  progress: number
  lines: number
  chars: number
  target: string
  copied: boolean
  onCopy: () => void
  canCopy: boolean
}) {
  const dot =
    status === "error"
      ? "bg-destructive"
      : status === "working"
        ? "bg-syntax-number"
        : status === "done"
          ? "bg-syntax-string"
          : "bg-muted-foreground"

  return (
    <footer className="flex h-8 shrink-0 items-center gap-4 border-t border-border bg-titlebar px-4 text-xs text-muted-foreground select-none">
      <div className="flex items-center gap-2">
        {status === "working" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-syntax-number" />
        ) : (
          <span className={cn("h-2 w-2 rounded-full", dot)} />
        )}
        <span className="font-medium text-foreground">{message}</span>
      </div>

      <div className="h-3 w-px bg-border" />

      <div className="flex items-center gap-2">
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              status === "error" ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <span className="tabular-nums">{Math.round(progress * 100)}%</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="tabular-nums">
          {lines} ln · {chars} ch
        </span>
        <span className="uppercase tracking-wide">{target}</span>
        <button
          type="button"
          onClick={onCopy}
          disabled={!canCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-medium transition-colors",
            "text-foreground hover:bg-accent disabled:opacity-40",
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-syntax-string" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>
    </footer>
  )
}
