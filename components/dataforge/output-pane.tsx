"use client"

import { TARGET_FORMATS, type TargetFormat } from "@/lib/forge"
import { CodeBlock } from "./code-block"
import { cn } from "@/lib/utils"
import { AlertTriangle, Download } from "lucide-react"

export function OutputPane({
  target,
  output,
  error,
  onDownload,
  wrap,
}: {
  target: TargetFormat
  output: string
  error: string | null
  onDownload: () => void
  wrap?: boolean
}) {
  const meta = TARGET_FORMATS.find((f) => f.id === target)!

  return (
    <section className="flex h-full min-w-0 flex-col bg-editor-bg">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output</span>
          <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {meta.label}
          </span>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={!output}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" />
          .{meta.ext}
        </button>
      </div>

      <div className={cn("relative flex-1 overflow-auto", error && "opacity-60")}>
        {error ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="flex max-w-sm flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Conversion failed</p>
              <p className="font-mono text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : output === "" ? (
          <div className="flex h-full items-center justify-center p-8">
            <p className="text-sm text-muted-foreground">Output will appear here after conversion.</p>
          </div>
        ) : (
          <CodeBlock code={output} lang={target} wrap={wrap} />
        )}
      </div>
    </section>
  )
}
