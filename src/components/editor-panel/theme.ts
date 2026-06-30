import { EditorView } from "@codemirror/view"

export function opencodeTheme() {
  return EditorView.theme(
    {
      "&": {
        backgroundColor: "var(--background-base)",
        color: "var(--text-base)",
        height: "100%",
      },
      ".cm-scroller": { overflow: "auto" },
      ".cm-content": { caretColor: "var(--text-base)" },
      ".cm-cursor": { borderLeftColor: "var(--text-base)" },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "var(--surface-info-base) !important",
      },
      ".cm-gutters": {
        backgroundColor: "var(--background-stronger)",
        border: "none",
        color: "var(--text-weak)",
      },
      ".cm-activeLineGutter": { backgroundColor: "var(--surface-base-active)" },
      ".cm-activeLine": { backgroundColor: "var(--surface-base-active)" },
      ".cm-matchingBracket": {
        backgroundColor: "var(--surface-info-base)",
        outline: "1px solid var(--border-weak-base)",
      },
      ".cm-foldPlaceholder": {
        backgroundColor: "var(--surface-base-active)",
        border: "none",
        color: "var(--text-weak)",
      },
      ".cm-tooltip": {
        backgroundColor: "var(--background-raised-base)",
        border: "1px solid var(--border-weak-base)",
      },
      ".cm-tooltip-autocomplete": {
        "& > ul > li[aria-selected]": {
          backgroundColor: "var(--surface-base-active)",
        },
      },
    },
    { dark: true },
  )
}
