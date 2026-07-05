export function TitleBar({ fileName }: { fileName: string }) {
  return (
    <div className="relative flex h-9 shrink-0 items-center border-b border-border bg-titlebar px-4 select-none">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 flex items-center justify-center gap-2">
        <span className="text-[13px] font-medium text-foreground">DataForge</span>
        <span className="text-[13px] text-muted-foreground">{"\u2014"}</span>
        <span className="text-[13px] text-muted-foreground">{fileName}</span>
      </div>
    </div>
  )
}
