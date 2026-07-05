import type { TargetFormat } from "@/lib/forge"
import { cn } from "@/lib/utils"

type Rule = { re: RegExp; cls: string }

const RULES: Record<TargetFormat, Rule[]> = {
  json: [
    { re: /\s+/y, cls: "" },
    { re: /"(?:[^"\\]|\\.)*"(?=\s*:)/y, cls: "text-syntax-key" },
    { re: /"(?:[^"\\]|\\.)*"/y, cls: "text-syntax-string" },
    { re: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y, cls: "text-syntax-number" },
    { re: /\b(?:true|false|null)\b/y, cls: "text-syntax-boolean" },
    { re: /[{}[\],:]/y, cls: "text-syntax-punct" },
  ],
  sql: [
    { re: /\s+/y, cls: "" },
    { re: /--[^\n]*/y, cls: "text-syntax-comment" },
    { re: /'(?:[^'\\]|\\.|'')*'/y, cls: "text-syntax-string" },
    {
      re: /\b(CREATE|TABLE|INSERT|INTO|VALUES|NULL|TRUE|FALSE|INTEGER|REAL|BOOLEAN|TEXT|PRIMARY|KEY|NOT)\b/iy,
      cls: "text-syntax-keyword",
    },
    { re: /-?\d+(?:\.\d+)?/y, cls: "text-syntax-number" },
    { re: /"(?:[^"\\]|\\.)*"/y, cls: "text-syntax-key" },
    { re: /[(),;]/y, cls: "text-syntax-punct" },
  ],
  typescript: [
    { re: /\s+/y, cls: "" },
    { re: /\/\/[^\n]*/y, cls: "text-syntax-comment" },
    { re: /\b(export|interface|type|extends|readonly|import|from)\b/y, cls: "text-syntax-keyword" },
    {
      re: /\b(string|number|boolean|null|undefined|unknown|any|Array|Record|void)\b/y,
      cls: "text-syntax-type",
    },
    { re: /"(?:[^"\\]|\\.)*"/y, cls: "text-syntax-string" },
    { re: /-?\d+(?:\.\d+)?/y, cls: "text-syntax-number" },
    { re: /[{}[\]<>();:,|?]/y, cls: "text-syntax-punct" },
  ],
  csv: [
    { re: /"(?:[^"\\]|\\.|"")*"/y, cls: "text-syntax-string" },
    { re: /,/y, cls: "text-syntax-punct" },
    { re: /\n/y, cls: "" },
  ],
}

type Token = { value: string; cls: string }

function tokenize(code: string, lang: TargetFormat): Token[] {
  const rules = RULES[lang]
  const tokens: Token[] = []
  let i = 0
  let buffer = ""

  const flush = () => {
    if (buffer) {
      tokens.push({ value: buffer, cls: "" })
      buffer = ""
    }
  }

  while (i < code.length) {
    let matched = false
    for (const rule of rules) {
      rule.re.lastIndex = i
      const m = rule.re.exec(code)
      if (m && m.index === i && m[0].length > 0) {
        flush()
        tokens.push({ value: m[0], cls: rule.cls })
        i += m[0].length
        matched = true
        break
      }
    }
    if (!matched) {
      buffer += code[i]
      i++
    }
  }
  flush()
  return tokens
}

export function CodeBlock({
  code,
  lang,
  wrap = false,
}: {
  code: string
  lang: TargetFormat
  wrap?: boolean
}) {
  const lineCount = code === "" ? 1 : code.split("\n").length
  const tokens = tokenize(code, lang)

  return (
    <div className="flex min-h-full font-mono text-[13px] leading-[1.6]">
      <div
        aria-hidden
        className="select-none border-r border-border/60 bg-editor-bg px-3 py-4 text-right text-editor-gutter"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre
        className={cn(
          "flex-1 overflow-x-auto px-4 py-4 text-foreground",
          wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre",
        )}
      >
        <code>
          {tokens.map((t, idx) =>
            t.cls ? (
              <span key={idx} className={cn(t.cls)}>
                {t.value}
              </span>
            ) : (
              <span key={idx}>{t.value}</span>
            ),
          )}
        </code>
      </pre>
    </div>
  )
}
