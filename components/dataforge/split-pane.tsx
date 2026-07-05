"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function SplitPane({
  left,
  right,
}: {
  left: React.ReactNode
  right: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState(0.5)
  const [dragging, setDragging] = useState(false)

  const onMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const next = (clientX - rect.left) / rect.width
      setRatio(Math.min(0.78, Math.max(0.22, next)))
    },
    [],
  )

  useEffect(() => {
    if (!dragging) return
    const move = (e: MouseEvent) => onMove(e.clientX)
    const up = () => setDragging(false)
    window.addEventListener("mousemove", move)
    window.addEventListener("mouseup", up)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener("mouseup", up)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [dragging, onMove])

  return (
    <div ref={containerRef} className="flex min-h-0 flex-1">
      <div style={{ width: `${ratio * 100}%` }} className="min-w-0">
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        onMouseDown={() => setDragging(true)}
        className="group relative w-px shrink-0 cursor-col-resize bg-border"
      >
        <span className="absolute inset-y-0 -left-1 -right-1 z-10" />
        <span
          className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors ${
            dragging ? "bg-primary" : "bg-transparent group-hover:bg-primary/60"
          }`}
        />
      </div>
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="min-w-0">
        {right}
      </div>
    </div>
  )
}
