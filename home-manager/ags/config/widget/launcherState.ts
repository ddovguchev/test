import { Variable } from "astal"

export const launcherVisible = Variable(false)
export const launcherQuery = Variable("")

export function toggleLauncher() {
    launcherVisible.set(!launcherVisible())
}

export function closeLauncher() {
    launcherVisible.set(false)
    launcherQuery.set("")
}
