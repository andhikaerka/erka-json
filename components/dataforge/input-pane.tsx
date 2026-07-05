"use client"

import { useRef, useState, type DragEvent } from "react"
import { cn } from "@/lib/utils"
import type { ValidationResult } from "@/lib/forge"
import { AlertTriangle, CheckCircle2, FileUp, Upload } from "lucide-react"

export function InputPane({
  value,
  onChange,
  onLoadFile,
  validationMode,
  validation,
}: {
  value: string
  onChange: (v: string) => void
  onLoadFile: (name: string, content: string) => void
  validationMode: boolean
  validation: ValidationResult | null
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => onLoadFile(file.name, String(reader.result ?? ""))
    reader.readAsText(file)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  return (
    <section className="flex h-full min-w-0 flex-col bg-card">
      <PaneHeader
        title="Input"
        subtitle="JSON"
        action={
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FileUp className="h-3.5 w-3.5" />
            Open file
          </button>
        }
      />

      <div
        className="relative flex-1 overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder='{\n  "paste": "your JSON here"\n}'
          className="h-full w-full resize-none bg-editor-bg px-4 py-4 font-mono text-[13px] leading-[1.6] text-foreground outline-none placeholder:text-muted-foreground/50"
        />

        {value.trim() === "" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8">
            <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">Drag & drop a file</p>
              <p className="text-xs text-muted-foreground">
                Drop a <span className="text-foreground">.json</span> file here, or start typing above
              </p>
            </div>
          </div>
        )}

        {dragging && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-primary">
              <FileUp className="h-6 w-6" />
              <span className="text-sm font-medium">Release to load file</span>
            </div>
          </div>
        )}
      </div>

      {validationMode && validation && (
        <ValidationStrip validation={validation} />
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) readFile(file)
          e.target.value = ""
        }}
      />
    </section>
  )
}

function ValidationStrip({ validation }: { validation: ValidationResult }) {
  if (validation.valid) {
    return (
      <div className="flex items-center gap-2 border-t border-border bg-secondary/40 px-4 py-2 text-xs">
        <CheckCircle2 className="h-3.5 w-3.5 text-syntax-string" />
        <span className="text-foreground">Valid JSON</span>
        <span className="text-muted-foreground">
          {validation.stats.keys} keys · depth {validation.stats.depth} · {validation.stats.nodes} nodes
        </span>
      </div>
    )
  }
  const issue = validation.issues[0]
  return (
    <div className="flex items-center gap-2 border-t border-destructive/40 bg-destructive/10 px-4 py-2 text-xs">
      <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
      <span className="font-medium text-destructive">
        Ln {issue.line}, Col {issue.column}
      </span>
      <span className="truncate text-foreground">{issue.message}</span>
    </div>
  )
}

function PaneHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</span>
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {subtitle}
        </span>
      </div>
      {action}
    </div>
  )
}
