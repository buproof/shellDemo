import { Show, Switch, Match, createMemo, createSignal, onMount, onCleanup } from "solid-js"
import { createMediaQuery } from "@solid-primitives/media"
import { IconButton } from "@/lib/ui/icon-button"
import { ResizeHandle } from "@/lib/ui/resize-handle"
import type { SnapshotFileDiff, VcsFileDiff } from "@/lib/sdk/v2"

import FileTree from "@/components/file-tree"
import { EditorPanel, EDITOR_FILE_OPEN_EVENT } from "@/components/editor-panel"
import { useFile } from "@/context/file"
import { useLanguage } from "@/context/language"
import { useLayout } from "@/context/layout"
import { useSettings } from "@/context/settings"
import { type Sizing } from "@/pages/session/helpers"
import { useSessionLayout } from "@/pages/session/session-layout"

type RenderDiff = (SnapshotFileDiff & { file: string }) | VcsFileDiff

function renderDiff(value: SnapshotFileDiff | VcsFileDiff): value is RenderDiff {
  return typeof value.file === "string"
}

const EDITOR_MIN_HEIGHT = 150
const FILE_TREE_MIN_HEIGHT = 120

export function SessionSidePanel(props: {
  diffs: () => (SnapshotFileDiff | VcsFileDiff)[]
  reviewSnap: boolean
  size: Sizing
}) {
  const layout = useLayout()
  const settings = useSettings()
  const file = useFile()
  const language = useLanguage()
  const { view, params } = useSessionLayout()

  const isDesktop = createMediaQuery("(min-width: 768px)")

  const reviewOpen = createMemo(() => isDesktop() && view().reviewPanel.opened())
  const open = createMemo(() => reviewOpen())
  const panelWidth = createMemo(() => {
    if (!open()) return "0px"
    return "auto"
  })

  const [containerHeight, setContainerHeight] = createSignal(0)
  let containerRef: HTMLDivElement | undefined

  onMount(() => {
    if (!containerRef) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    observer.observe(containerRef)
    onCleanup(() => observer.disconnect())
  })

  const editorMaxHeight = createMemo(() => {
    const available = containerHeight() - FILE_TREE_MIN_HEIGHT
    return Math.max(available, EDITOR_MIN_HEIGHT)
  })

  const handleEditorResize = (h: number) => {
    const clamped = Math.min(h, Math.max(EDITOR_MIN_HEIGHT, editorMaxHeight()))
    layout.editorPanel.resize(clamped)
  }

  const diffs = createMemo(() => props.diffs().filter(renderDiff))
  const diffFiles = createMemo(() => diffs().map((d) => d.file))
  const kinds = createMemo(() => {
    const merge = (a: "add" | "del" | "mix" | undefined, b: "add" | "del" | "mix") => {
      if (!a) return b
      if (a === b) return a
      return "mix" as const
    }

    const normalize = (p: string) => p.replaceAll("\\\\", "/").replace(/\/+$/, "")

    const out = new Map<string, "add" | "del" | "mix">()
    for (const diff of diffs()) {
      const f = normalize(diff.file)
      const kind = diff.status === "added" ? "add" : diff.status === "deleted" ? "del" : "mix"

      out.set(f, kind)

      const parts = f.split("/")
      for (const [idx] of parts.slice(0, -1).entries()) {
        const dir = parts.slice(0, idx + 1).join("/")
        if (!dir) continue
        out.set(dir, merge(out.get(dir), kind))
      }
    }
    return out
  })

  const nofiles = createMemo(() => {
    const state = file.tree.state("")
    if (!state?.loaded) return false
    return file.tree.children("").length === 0
  })

  const handleFileClick = (node: { path: string }) => {
    window.dispatchEvent(new CustomEvent(EDITOR_FILE_OPEN_EVENT, { detail: node.path }))
  }

  const handleRefresh = () => {
    void file.tree.refresh("")
  }

  const handleCollapseAll = () => {
    const rootChildren = file.tree.children("")
    const collapseRecursive = (nodes: { path: string; type: string }[]) => {
      for (const node of nodes) {
        if (node.type === "directory") {
          file.tree.collapse(node.path)
          collapseRecursive(file.tree.children(node.path))
        }
      }
    }
    collapseRecursive(rootChildren)
  }

  return (
    <Show when={isDesktop() && !(settings.general.newLayoutDesigns() && !params.id)}>
      <aside
        id="review-panel"
        aria-label={language.t("session.panel.reviewAndFiles")}
        aria-hidden={!open()}
        inert={!open()}
        class="relative min-w-0 h-full flex shrink-0 overflow-hidden bg-background-base"
        classList={{
          "pointer-events-none": !open(),
          "transition-[width] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[width] motion-reduce:transition-none":
            !props.size.active() && !props.reviewSnap,
          "rounded-[10px] shadow-[var(--v2-elevation-raised)] overflow-hidden": settings.general.newLayoutDesigns(),
          "flex-1": reviewOpen(),
        }}
        style={{ width: panelWidth() }}
      >
        <Show when={open()}>
          <div
            ref={containerRef}
            class="size-full flex flex-col"
            classList={{
              "border-l border-border-weaker-base": !settings.general.newLayoutDesigns(),
            }}
          >
            <Show when={layout.editorPanel.opened()}>
              <div style={{ height: `${layout.editorPanel.height()}px` }} class="shrink-0 overflow-hidden">
                <EditorPanel
                  height={layout.editorPanel.height()}
                  onResize={handleEditorResize}
                />
              </div>
              <div class="shrink-0 relative">
                <ResizeHandle
                  direction="vertical"
                  edge="end"
                  size={layout.editorPanel.height()}
                  min={EDITOR_MIN_HEIGHT}
                  max={editorMaxHeight()}
                  onResize={handleEditorResize}
                />
              </div>
            </Show>

            <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div class="shrink-0 flex items-center justify-between px-3 h-8 border-b border-border-weaker-base">
                <span class="text-12-medium text-text-weak uppercase tracking-wider">
                  {language.t("session.tab.files")}
                </span>
                <div class="flex items-center gap-0.5">
                  <IconButton
                    icon="reset"
                    variant="ghost"
                    iconSize="small"
                    class="h-5 w-5"
                    onClick={handleRefresh}
                    aria-label={language.t("common.refresh")}
                  />
                  <IconButton
                    icon="collapse"
                    variant="ghost"
                    iconSize="small"
                    class="h-5 w-5"
                    onClick={handleCollapseAll}
                    aria-label={language.t("session.files.collapseAll")}
                  />
                </div>
              </div>
              <div class="flex-1 min-h-0 overflow-auto bg-background-stronger px-3 py-0">
                <Switch>
                  <Match when={nofiles()}>
                    <div class="h-full flex items-center justify-center text-center">
                      <div class="text-12-regular text-text-weak">{language.t("session.files.empty")}</div>
                    </div>
                  </Match>
                  <Match when={true}>
                    <FileTree
                      path=""
                      class="pt-3"
                      modified={diffFiles()}
                      kinds={kinds()}
                      onFileClick={handleFileClick}
                    />
                  </Match>
                </Switch>
              </div>
            </div>
          </div>
        </Show>
      </aside>
    </Show>
  )
}
