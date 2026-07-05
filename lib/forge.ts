import yaml from "js-yaml"
import { XMLParser, XMLValidator } from "fast-xml-parser"

export type TargetFormat = "json" | "sql" | "csv" | "typescript"

export const TARGET_FORMATS: { id: TargetFormat; label: string; ext: string }[] = [
  { id: "json", label: "JSON", ext: "json" },
  { id: "sql", label: "SQL", ext: "sql" },
  { id: "csv", label: "CSV", ext: "csv" },
  { id: "typescript", label: "TypeScript", ext: "ts" },
]

export type SourceFormat = "json" | "yaml" | "xml"

export const SOURCE_FORMATS: { id: SourceFormat; label: string; exts: string[] }[] = [
  { id: "json", label: "JSON", exts: ["json"] },
  { id: "yaml", label: "YAML", exts: ["yaml", "yml"] },
  { id: "xml", label: "XML", exts: ["xml"] },
]

export function detectSource(fileName: string): SourceFormat | null {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return SOURCE_FORMATS.find((f) => f.exts.includes(ext))?.id ?? null
}

/* ------------------------------ Source parsing ---------------------------- */

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true,
  trimValues: true,
})

/** Parse any supported source format into a plain JS value. Throws on error. */
export function parseSource(input: string, source: SourceFormat): unknown {
  if (input.trim() === "") throw new Error("Input is empty.")
  switch (source) {
    case "json":
      return JSON.parse(input)
    case "yaml": {
      const result = yaml.load(input)
      if (result === undefined) throw new Error("YAML produced no document.")
      return result
    }
    case "xml": {
      const check = XMLValidator.validate(input)
      if (check !== true) {
        throw new Error(check.err.msg)
      }
      return xmlParser.parse(input)
    }
  }
}

export type ConvertResult = { ok: true; output: string } | { ok: false; error: string }

export type ValidationIssue = { line: number; column: number; message: string }
export type ValidationResult = {
  valid: boolean
  issues: ValidationIssue[]
  stats: { keys: number; depth: number; nodes: number; bytes: number }
}

/* ------------------------------- Validation ------------------------------- */

function locate(input: string, position: number): { line: number; column: number } {
  const upto = input.slice(0, position)
  const lines = upto.split("\n")
  return { line: lines.length, column: lines[lines.length - 1].length + 1 }
}

export function validate(input: string): ValidationResult {
  const empty = { keys: 0, depth: 0, nodes: 0, bytes: 0 }
  if (input.trim() === "") {
    return { valid: false, issues: [{ line: 1, column: 1, message: "Input is empty." }], stats: empty }
  }
  try {
    const parsed = JSON.parse(input)
    return { valid: true, issues: [], stats: analyze(parsed, input) }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid JSON."
    const match = message.match(/position (\d+)/)
    const pos = match ? Number(match[1]) : 0
    const { line, column } = locate(input, pos)
    return {
      valid: false,
      issues: [{ line, column, message: message.replace(/ in JSON.*/, "") }],
      stats: empty,
    }
  }
}

function analyze(value: unknown, raw: string) {
  let keys = 0
  let nodes = 0
  let maxDepth = 0
  const walk = (v: unknown, depth: number) => {
    nodes++
    maxDepth = Math.max(maxDepth, depth)
    if (Array.isArray(v)) {
      v.forEach((item) => walk(item, depth + 1))
    } else if (v && typeof v === "object") {
      for (const [, val] of Object.entries(v)) {
        keys++
        walk(val, depth + 1)
      }
    }
  }
  walk(value, 1)
  return { keys, depth: maxDepth, nodes, bytes: new Blob([raw]).size }
}

/* --------------------------------- CSV ------------------------------------ */

function toCsv(data: unknown): string {
  const arr = Array.isArray(data) ? data : [data]
  if (arr.length === 0) return ""
  const headers = Array.from(
    arr.reduce<Set<string>>((set, item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        Object.keys(item as object).forEach((k) => set.add(k))
      }
      return set
    }, new Set<string>()),
  )
  if (headers.length === 0) throw new Error("CSV output requires an array of objects.")
  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return ""
    const str = typeof val === "object" ? JSON.stringify(val) : String(val)
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }
  const lines = [headers.join(",")]
  for (const item of arr) {
    const record = (item ?? {}) as Record<string, unknown>
    lines.push(headers.map((h) => escape(record[h])).join(","))
  }
  return lines.join("\n")
}

/* --------------------------------- SQL ------------------------------------ */

function sqlType(value: unknown): string {
  if (typeof value === "number") return Number.isInteger(value) ? "INTEGER" : "REAL"
  if (typeof value === "boolean") return "BOOLEAN"
  return "TEXT"
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL"
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  const str = typeof value === "object" ? JSON.stringify(value) : String(value)
  return `'${str.replace(/'/g, "''")}'`
}

function toSql(data: unknown, table = "data"): string {
  const arr = Array.isArray(data) ? data : [data]
  const rows = arr.filter((r) => r && typeof r === "object" && !Array.isArray(r)) as Record<
    string,
    unknown
  >[]
  if (rows.length === 0) throw new Error("SQL output requires an object or array of objects.")

  const columns = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k))
      return set
    }, new Set<string>()),
  )

  const typeFor = (col: string): string => {
    const sample = rows.find((r) => r[col] !== null && r[col] !== undefined)?.[col]
    return sample === undefined ? "TEXT" : sqlType(sample)
  }

  const createLines = columns.map((c, i) => {
    const comma = i < columns.length - 1 ? "," : ""
    return `  "${c}" ${typeFor(c)}${comma}`
  })
  const create = `CREATE TABLE "${table}" (\n${createLines.join("\n")}\n);`

  const inserts = rows.map((row) => {
    const cols = columns.map((c) => `"${c}"`).join(", ")
    const vals = columns.map((c) => sqlLiteral(row[c])).join(", ")
    return `INSERT INTO "${table}" (${cols}) VALUES (${vals});`
  })

  return `${create}\n\n${inserts.join("\n")}`
}

/* ------------------------------ TypeScript -------------------------------- */

function tsType(value: unknown, indent: number): string {
  if (value === null) return "null"
  if (typeof value === "string") return "string"
  if (typeof value === "number") return "number"
  if (typeof value === "boolean") return "boolean"
  if (Array.isArray(value)) {
    if (value.length === 0) return "unknown[]"
    const inner = tsType(value[0], indent)
    return inner.includes("\n") ? `Array<${inner}>` : `${inner}[]`
  }
  if (typeof value === "object") {
    const pad = "  ".repeat(indent + 1)
    const closePad = "  ".repeat(indent)
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) => `${pad}${safeKey(k)}: ${tsType(v, indent + 1)}`,
    )
    if (entries.length === 0) return "Record<string, unknown>"
    return `{\n${entries.join("\n")}\n${closePad}}`
  }
  return "unknown"
}

function safeKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `"${key}"`
}

function toTypeScript(data: unknown, name = "Root"): string {
  const sample = Array.isArray(data) ? data[0] ?? {} : data
  if (sample && typeof sample === "object" && !Array.isArray(sample)) {
    const pad = "  "
    const entries = Object.entries(sample as Record<string, unknown>).map(
      ([k, v]) => `${pad}${safeKey(k)}: ${tsType(v, 1)}`,
    )
    const body = entries.length ? `\n${entries.join("\n")}\n` : ""
    const iface = `export interface ${name} {${body}}`
    return Array.isArray(data) ? `${iface}\n\nexport type ${name}List = ${name}[]` : iface
  }
  return `export type ${name} = ${tsType(data, 0)}`
}

/* ------------------------------- Public API ------------------------------- */

export function convert(input: string, target: TargetFormat): ConvertResult {
  try {
    if (input.trim() === "") throw new Error("Input is empty.")
    const parsed = JSON.parse(input)
    switch (target) {
      case "json":
        return { ok: true, output: JSON.stringify(parsed, null, 2) }
      case "csv":
        return { ok: true, output: toCsv(parsed) }
      case "sql":
        return { ok: true, output: toSql(parsed) }
      case "typescript":
        return { ok: true, output: toTypeScript(parsed) }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Conversion failed."
    return { ok: false, error: message }
  }
}

export function countStats(text: string): { lines: number; chars: number } {
  if (text === "") return { lines: 0, chars: 0 }
  return { lines: text.split("\n").length, chars: text.length }
}
