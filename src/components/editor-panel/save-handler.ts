import { createTwoFilesPatch } from "diff"
import { useSDK } from "@/context/sdk"
import { useServerSync } from "@/context/server-sync"
import { showToast } from "@/utils/toast"
import { useLanguage } from "@/context/language"

export function createSaveHandler() {
  const sdk = useSDK()
  const sync = useServerSync()
  const language = useLanguage()

  async function saveFile(path: string, originalContent: string, newContent: string): Promise<boolean> {
    if (originalContent === newContent) return true

    const patch = createTwoFilesPatch(path, path, originalContent, newContent, "", "")

    const result = await sdk()
      .client.vcs.apply({ patch })
      .then((x) => x.data)
      .catch((err) => {
        showToast({
          variant: "error",
          title: language.t("editor.save.failed"),
          description: err?.data?.message ?? String(err),
        })
        return undefined
      })

    if (!result?.applied) {
      showToast({
        variant: "error",
        title: language.t("editor.save.failed"),
        description: language.t("editor.save.conflict"),
      })
      return false
    }

    showToast({
      title: language.t("editor.save.success"),
    })

    void sync().project.loadSessions(sdk().directory)
    return true
  }

  return { saveFile }
}
