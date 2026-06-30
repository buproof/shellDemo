import { createStore, produce } from "solid-js/store"
import { createMemo } from "solid-js"

type DirtyEntry = {
  original: string
  current: string
}

type DirtyState = {
  files: Record<string, DirtyEntry>
}

export function createDirtyStateManager() {
  const [state, setState] = createStore<DirtyState>({ files: {} })

  const register = (path: string, original: string) => {
    setState("files", path, { original, current: original })
  }

  const update = (path: string, current: string) => {
    if (!state.files[path]) return
    setState("files", path, "current", current)
  }

  const isDirty = (path: string): boolean => {
    const entry = state.files[path]
    return !!entry && entry.original !== entry.current
  }

  const anyDirty = createMemo(() =>
    Object.values(state.files).some((entry) => entry.original !== entry.current)
  )

  const markClean = (path: string) => {
    const entry = state.files[path]
    if (!entry) return
    setState("files", path, "original", entry.current)
  }

  const remove = (path: string) => {
    setState(
      produce((draft) => {
        delete draft.files[path]
      }),
    )
  }

  const getOriginal = (path: string): string => {
    return state.files[path]?.original ?? ""
  }

  const getCurrent = (path: string): string => {
    return state.files[path]?.current ?? ""
  }

  return { register, update, isDirty, anyDirty, markClean, remove, getOriginal, getCurrent }
}
