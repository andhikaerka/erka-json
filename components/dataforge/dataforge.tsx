"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { convert, countStats, TARGET_FORMATS, validate, type TargetFormat } from "@/lib/forge"
import { TitleBar } from "./title-bar"
import { Sidebar, type NavId } from "./sidebar"
import { TopBar } from "./top-bar"
import { SplitPane } from "./split-pane"
import { InputPane } from "./input-pane"
import { OutputPane } from "./output-pane"
import { StatusBar, type StatusKind } from "./status-bar"
import { RecentPanel, SettingsPanel, ValidatorReport } from "./panels"

const SAMPLE = `[
  {
    "id": 1,
    "name": "Ada Lovelace",
    "email": "ada@analytical.dev",
    "active": true,
    "score": 98.5,
    "roles": ["admin", "engineer"]
  },
  {
    "id": 2,
    "name": "Alan Turing",
    "email": "alan@enigma.io",
    "active": false,
    "score": 87.2,
    "roles": ["engineer"]
  }
]`

export function DataForge() {
  const [nav, setNav] = useState<NavId>("converter")
  const [input, setInput] = useState(SAMPLE)
  const [fileName, setFileName] = useState("untitled.json")
  const [target, setTarget] = useState<TargetFormat>("typescript")
  const [validationMode, setValidationMode] = useState(true)
  const [wordWrap, setWordWrap] = useState(false)

  const [status, setStatus] = useState<StatusKind>("ready")
  const [statusMsg, setStatusMsg] = useState("Ready")
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const result = useMemo(() => convert(input, target), [input, target])
  const validation = useMemo(() => validate(input), [input])
  const output = result.ok ? result.output : ""
  const error = result.ok ? null : result.error
  const stats = countStats(output)

  useEffect(() => {
    const t = timers.current
    return () => t.forEach(clearTimeout)
  }, [])

  const runConvert = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setBusy(true)
    setStatus("working")
    setStatusMsg("Converting…")
    setProgress(0)
    ;[0.35, 0.7, 0.95].forEach((p, i) => {
      timers.current.push(setTimeout(() => setProgress(p), 90 * (i + 1)))
    })
    timers.current.push(
      setTimeout(() => {
        setProgress(1)
        setBusy(false)
        if (result.ok) {
          setStatus("done")
          setStatusMsg(`Converted to ${TARGET_FORMATS.find((f) => f.id === target)!.label}`)
        } else {
          setStatus("error")
          setStatusMsg("Conversion failed")
        }
      }, 380),
    )
  }

  const handleCopy = async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setStatus("error")
      setStatusMsg("Clipboard unavailable")
    }
  }

  const handleDownload = () => {
    if (!output) return
    const meta = TARGET_FORMATS.find((f) => f.id === target)!
    const base = fileName.replace(/\.[^.]+$/, "") || "output"
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${base}.${meta.ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadFile = (name: string, content: string) => {
    setFileName(name)
    setInput(content)
    setNav("converter")
    setStatus("ready")
    setStatusMsg("File loaded")
    setProgress(0)
  }

  const inputPane = (
    <InputPane
      value={input}
      onChange={(v) => {
        setInput(v)
        setStatus("ready")
        setStatusMsg("Ready")
        setProgress(0)
      }}
      onLoadFile={loadFile}
      validationMode={validationMode}
      validation={validation}
    />
  )

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        <TitleBar fileName={fileName} />
        <div className="flex min-h-0 flex-1">
          <Sidebar active={nav} onChange={setNav} />
          <div className="flex min-h-0 flex-1 flex-col">
            <TopBar
              fileName={fileName}
              target={target}
              onTargetChange={setTarget}
              validationMode={validationMode}
              onValidationChange={setValidationMode}
              onConvert={runConvert}
              busy={busy}
            />

            <main className="flex min-h-0 flex-1 overflow-hidden">
              {nav === "converter" && (
                <SplitPane
                  left={inputPane}
                  right={
                    <OutputPane
                      target={target}
                      output={output}
                      error={error}
                      onDownload={handleDownload}
                      wrap={wordWrap}
                    />
                  }
                />
              )}

              {nav === "validator" && (
                <SplitPane
                  left={inputPane}
                  right={
                    <div className="h-full overflow-auto bg-background">
                      <ValidatorReport validation={validation} />
                    </div>
                  }
                />
              )}

              {nav === "recent" && (
                <div className="h-full flex-1 overflow-auto bg-background">
                  <RecentPanel onOpen={(name) => loadFile(name, input)} />
                </div>
              )}

              {nav === "settings" && (
                <div className="h-full flex-1 overflow-auto bg-background">
                  <SettingsPanel
                    validationMode={validationMode}
                    onValidationChange={setValidationMode}
                    wordWrap={wordWrap}
                    onWordWrapChange={setWordWrap}
                  />
                </div>
              )}
            </main>

            <StatusBar
              status={status}
              message={statusMsg}
              progress={progress}
              lines={stats.lines}
              chars={stats.chars}
              target={target}
              copied={copied}
              onCopy={handleCopy}
              canCopy={!!output}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
