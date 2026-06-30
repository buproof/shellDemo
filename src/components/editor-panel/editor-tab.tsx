import { type Component, Show } from "solid-js"
import { IconButton } from "@/lib/ui/icon-button"

type EditorTabProps = {
  name: string
  active: boolean
  dirty: boolean
  onSelect: () => void
  onClose: () => void
}

export const EditorTab: Component<EditorTabProps> = (props) => {
  return (
    <div
      class="group/tab shrink-0 flex items-center h-8 pl-3 pr-1 gap-1 border-r border-border-weaker-base cursor-default"
      classList={{
        "bg-background-base": props.active,
        "bg-background-stronger hover:bg-background-base": !props.active,
      }}
      onClick={props.onSelect}
    >
      <span
        class="text-12-regular truncate max-w-[120px]"
        classList={{
          "text-text-strong": props.active,
          "text-text-base": !props.active,
        }}
      >
        {props.name}
      </span>
      <Show when={props.dirty}>
        <span class="size-1.5 rounded-full bg-text-base shrink-0" />
      </Show>
      <IconButton
        icon="close-small"
        variant="ghost"
        size="small"
        class="h-5 w-5 opacity-0 group-hover/tab:opacity-100"
        classList={{ "opacity-100": props.active }}
        onClick={(e) => {
          e.stopPropagation()
          props.onClose()
        }}
      />
    </div>
  )
}
