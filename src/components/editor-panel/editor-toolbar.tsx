import { type Component } from "solid-js"
import { Button } from "@/lib/ui/button"
import { useLanguage } from "@/context/language"

type EditorToolbarProps = {
  onSave: () => void
}

export const EditorToolbar: Component<EditorToolbarProps> = (props) => {
  const language = useLanguage()

  return (
    <div class="shrink-0 flex items-center justify-between px-3 py-2 border-t border-border-weaker-base bg-background-stronger">
      <span class="text-12-regular text-text-weak flex items-center gap-1.5">
        <span class="size-1.5 rounded-full bg-text-base" />
        {language.t("editor.modified")}
      </span>
      <Button size="small" variant="primary" onClick={props.onSave}>
        {language.t("editor.save.button")}
      </Button>
    </div>
  )
}
