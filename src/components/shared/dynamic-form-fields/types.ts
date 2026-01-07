import type { LucideIcon } from "lucide-react"
import { Hash, Type, ToggleLeft, FileText, ListFilter, Layers } from "lucide-react"

export interface DbFieldDefinition {
  _id: string
  name: string
  label: string
  type: "text" | "number" | "select" | "checkbox" | "textarea"
  required: boolean
  placeholder?: string
  description?: string
  options?: string // JSON string of options array
  min?: number
  max?: number
  displayOrder: number
  isActive: boolean
}

export interface SelectOption {
  value: string
  label: string
}

export interface FieldRenderProps {
  fieldDef: DbFieldDefinition
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  isInvalid: boolean
  errors: string[]
  isHighlighted?: boolean
}

export function getFieldIcon(type: string, name: string): LucideIcon {
  if (name === "albumCount") return Layers
  switch (type) {
    case "number":
      return Hash
    case "text":
      return Type
    case "checkbox":
      return ToggleLeft
    case "textarea":
      return FileText
    case "select":
      return ListFilter
    default:
      return Type
  }
}

export function parseSelectOptions(optionsJson?: string): SelectOption[] {
  if (!optionsJson) return []
  try {
    return JSON.parse(optionsJson)
  } catch {
    return []
  }
}

export function hasAlbumConfig(fields: DbFieldDefinition[]): boolean {
  return (
    fields.some((f) => f.name === "albumCount") &&
    fields.some((f) => f.name === "sheetsPerAlbum")
  )
}

export function filterAlbumFields(
  fields: DbFieldDefinition[]
): DbFieldDefinition[] {
  if (!hasAlbumConfig(fields)) return fields
  return fields.filter((f) => f.name !== "sheetsPerAlbum")
}
