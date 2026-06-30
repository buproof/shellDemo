import { For, Show, createMemo, createEffect, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"
import { IconButton } from "@/lib/ui/icon-button"
import { useFile } from "@/context/file"
import { useSDK } from "@/context/sdk"
import { useLanguage } from "@/context/language"
import { useDialog } from "@/lib/ui/context/dialog"
import { DialogSelectFile } from "@/components/dialog-select-file"
import { CodeEditor } from "./code-editor"
import { EditorTab } from "./editor-tab"
import { EditorToolbar } from "./editor-toolbar"
import { createDirtyStateManager } from "./dirty-state"
import { createSaveHandler } from "./save-handler"

export const EDITOR_FILE_OPEN_EVENT = "opencode:editor-file-open"

type EditorPanelProps = {
  height: number
  onResize: (height: number) => void
}

export function EditorPanel(props: EditorPanelProps) {
  const file = useFile()
  const sdk = useSDK()
  const language = useLanguage()
  const dialog = useDialog()
  const dirty = createDirtyStateManager()
  const { saveFile } = createSaveHandler()

  const [store, setStore] = createStore<{
    tabs: string[]
    activeTab: string | undefined
  }>({
    tabs: [],
    activeTab: undefined,
  })

  const fileContents = new Map<string, string>()

  const openFile = (path: string) => {
    const normalized = path.startsWith("/") ? path : `/${path}`
    if (!store.tabs.includes(normalized)) {
      setStore("tabs", (t) => [...t, normalized])
    }
    setStore("activeTab", normalized)
    void file.load(normalized)
  }

  const handleEditorFileOpen = (e: Event) => {
    const path = (e as CustomEvent).detail as string
    if (path) openFile(path)
  }
  window.addEventListener(EDITOR_FILE_OPEN_EVENT, handleEditorFileOpen)
  onCleanup(() => window.removeEventListener(EDITOR_FILE_OPEN_EVENT, handleEditorFileOpen))

  const closeTab = (path: string) => {
    const idx = store.tabs.indexOf(path)
    setStore("tabs", (t) => t.filter((p) => p !== path))
    dirty.remove(path)
    fileContents.delete(path)
    if (store.activeTab === path) {
      setStore("activeTab", store.tabs[idx + 1] ?? store.tabs[idx - 1] ?? undefined)
    }
  }

  const activePath = createMemo(() => store.activeTab)

  const activeContent = createMemo(() => {
    const p = activePath()
    if (!p) return ""
    return fileContents.get(p) ?? file.get(p)?.content?.content ?? ""
  })

  createEffect(() => {
    const p = activePath()
    if (!p) return
    const state = file.get(p)
    if (state?.loaded && state.content && !fileContents.has(p)) {
      fileContents.set(p, state.content.content)
      dirty.register(p, state.content.content)
    }
  })

  const handleChange = (path: string, value: string) => {
    fileContents.set(path, value)
    dirty.update(path, value)
  }

  const handleSave = async () => {
    const path = activePath()
    if (!path) return
    const state = file.get(path)
    const original = state?.loaded ? (state.content?.content ?? "") : dirty.getOriginal(path)
    const current = fileContents.get(path) ?? ""
    const ok = await saveFile(path, original, current)
    if (ok) {
      dirty.markClean(path)
      void file.load(path, { force: true })
    }
  }

  return (
    <div
      class="h-full flex flex-col bg-background-base overflow-hidden"
      style={{ height: `${props.height}px` }}
    >
      <div class="shrink-0 flex items-center border-b border-border-weaker-base overflow-x-auto">
        <For each={store.tabs}>
          {(path) => (
            <EditorTab
              name={path.split("/").pop() ?? path}
              active={activePath() === path}
              dirty={dirty.isDirty(path)}
              onSelect={() => setStore("activeTab", path)}
              onClose={() => closeTab(path)}
            />
          )}
        </For>
        <IconButton
          icon="plus-small"
          variant="ghost"
          onClick={() => {
            dialog.show(() => <DialogSelectFile mode="files" onOpenFile={openFile} />)
          }}
        />
      </div>

      <div class="flex-1 min-h-0">
        <Show
          when={activePath()}
          keyed
        >
          {(path) => (
            <CodeEditor
              value={activeContent()}
              path={path}
              onChange={(v) => handleChange(path, v)}
              onSave={handleSave}
            />
          )}
        </Show>
        <Show when={!activePath()}>
          <div class="h-full flex items-center justify-center text-text-weak text-14-regular">
            {language.t("editor.empty")}
          </div>
        </Show>
      </div>

      <Show when={activePath() && dirty.isDirty(activePath()!)}>
        <EditorToolbar onSave={handleSave} />
      </Show>
    </div>
  )
}
