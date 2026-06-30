import { onMount, onCleanup, createEffect, type Component } from "solid-js"
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter,
         highlightActiveLine } from "@codemirror/view"
import { EditorState, Compartment } from "@codemirror/state"
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from "@codemirror/language"
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search"
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete"
import { resolveLanguage } from "./language-resolver"
import { opencodeTheme } from "./theme"

type CodeEditorProps = {
  value: string
  path: string
  onChange?: (value: string) => void
  onSave?: () => void
  readOnly?: boolean
}

export const CodeEditor: Component<CodeEditorProps> = (props) => {
  let containerRef: HTMLDivElement | undefined
  let view: EditorView | undefined
  const langCompartment = new Compartment()
  const readOnlyCompartment = new Compartment()
  let ignoreNextUpdate = false

  onMount(() => {
    if (!containerRef) return
    view = new EditorView({
      state: EditorState.create({
        doc: props.value,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          foldGutter(),
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...completionKeymap,
            indentWithTab,
            {
              key: "Mod-s",
              run: () => {
                props.onSave?.()
                return true
              },
            },
          ]),
          langCompartment.of(resolveLanguage(props.path)),
          readOnlyCompartment.of(EditorState.readOnly.of(props.readOnly ?? false)),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !ignoreNextUpdate) {
              props.onChange?.(update.state.doc.toString())
            }
          }),
          opencodeTheme(),
        ],
      }),
      parent: containerRef,
    })
  })

  onCleanup(() => view?.destroy())

  createEffect(() => {
    if (!view) return
    const current = view.state.doc.toString()
    if (props.value !== current) {
      ignoreNextUpdate = true
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: props.value },
      })
      ignoreNextUpdate = false
    }
  })

  createEffect(() => {
    if (!view) return
    view.dispatch({
      effects: langCompartment.reconfigure(resolveLanguage(props.path)),
    })
  })

  return (
    <div
      ref={containerRef}
      class="cm-editor-container h-full overflow-hidden [&_.cm-editor.cm-focused]:outline-none"
    />
  )
}
