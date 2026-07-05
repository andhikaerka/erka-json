"use client"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeftRight, ShieldCheck, Clock, Settings, Boxes } from "lucide-react"

export type NavId = "converter" | "validator" | "recent" | "settings"

const TOP: { id: NavId; label: string; icon: typeof ArrowLeftRight }[] = [
  { id: "converter", label: "Converter", icon: ArrowLeftRight },
  { id: "validator", label: "Validator", icon: ShieldCheck },
  { id: "recent", label: "Recent", icon: Clock },
]

export function Sidebar({
  active,
  onChange,
}: {
  active: NavId
  onChange: (id: NavId) => void
}) {
  return (
    <nav className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border bg-sidebar py-3">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Boxes className="h-5 w-5" />
      </div>

      {TOP.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onClick={() => onChange(item.id)} />
      ))}

      <div className="mt-auto">
        <NavButton
          item={{ id: "settings", label: "Settings", icon: Settings }}
          active={active === "settings"}
          onClick={() => onChange("settings")}
        />
      </div>
    </nav>
  )
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { id: NavId; label: string; icon: typeof ArrowLeftRight }
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
          active
            ? "bg-accent text-primary"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        {active && (
          <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
        )}
        <Icon className="h-[18px] w-[18px]" />
      </TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}
