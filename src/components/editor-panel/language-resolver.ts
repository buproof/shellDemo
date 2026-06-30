import { Extension } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { css } from "@codemirror/lang-css"
import { html } from "@codemirror/lang-html"
import { json } from "@codemirror/lang-json"
import { markdown } from "@codemirror/lang-markdown"
import { python } from "@codemirror/lang-python"
import { rust } from "@codemirror/lang-rust"
import { java } from "@codemirror/lang-java"
import { go } from "@codemirror/lang-go"
import { sql } from "@codemirror/lang-sql"

const extensions: Record<string, () => Extension> = {
  ".js": () => javascript({ jsx: false }),
  ".jsx": () => javascript({ jsx: true }),
  ".mjs": () => javascript({ jsx: false }),
  ".cjs": () => javascript({ jsx: false }),
  ".ts": () => javascript({ jsx: false, typescript: true }),
  ".tsx": () => javascript({ jsx: true, typescript: true }),
  ".mts": () => javascript({ jsx: false, typescript: true }),
  ".cts": () => javascript({ jsx: false, typescript: true }),
  ".css": () => css(),
  ".scss": () => css(),
  ".less": () => css(),
  ".html": () => html(),
  ".htm": () => html(),
  ".svg": () => html(),
  ".json": () => json(),
  ".jsonc": () => json(),
  ".md": () => markdown(),
  ".mdx": () => markdown(),
  ".py": () => python(),
  ".rs": () => rust(),
  ".java": () => java(),
  ".go": () => go(),
  ".sql": () => sql(),
}

export function resolveLanguage(path: string): Extension {
  for (const [ext, factory] of Object.entries(extensions)) {
    if (path.endsWith(ext)) return factory()
  }
  return []
}
