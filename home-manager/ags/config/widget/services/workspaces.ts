import { closePanel } from "../launcherState"
import { runCommand, runJsonCommand } from "../shared/shell"

export type WorkspaceCard = {
    id: number
    name: string
    active: boolean
    apps: string[]
}

export function listWorkspaceCards(): WorkspaceCard[] {
    const workspacesRaw = runJsonCommand("hyprctl -j workspaces")
    const clientsRaw = runJsonCommand("hyprctl -j clients")
    const activeRaw = runJsonCommand("hyprctl -j activeworkspace")

    const workspaces = Array.isArray(workspacesRaw) ? workspacesRaw : []
    const clients = Array.isArray(clientsRaw) ? clientsRaw : []
    const activeId = Number(activeRaw?.id ?? -1)

    const clientsByWorkspace = new Map<number, string[]>()
    clients.forEach((client: any) => {
        const workspaceId = Number(client?.workspace?.id ?? -1)
        if (workspaceId <= 0) return
        const title = String(client?.title ?? "").trim()
        const appClass = String(client?.class ?? "").trim()
        const label = title || appClass || "App"
        const items = clientsByWorkspace.get(workspaceId) ?? []
        items.push(label)
        clientsByWorkspace.set(workspaceId, items)
    })

    const ids = new Set<number>()
    workspaces.forEach((ws: any) => {
        const id = Number(ws?.id ?? -1)
        if (id > 0) ids.add(id)
    })
    clients.forEach((client: any) => {
        const id = Number(client?.workspace?.id ?? -1)
        if (id > 0) ids.add(id)
    })
    if (activeId > 0) ids.add(activeId)

    const maxId = Math.max(1, ...Array.from(ids))
    const workspaceMeta = new Map<number, any>()
    workspaces.forEach((ws: any) => {
        const id = Number(ws?.id ?? -1)
        if (id > 0) workspaceMeta.set(id, ws)
    })

    return Array.from({ length: maxId }, (_, index) => {
        const id = index + 1
        const meta = workspaceMeta.get(id)
        return {
            id,
            name: String(meta?.name ?? id),
            active: id === activeId,
            apps: clientsByWorkspace.get(id) ?? [],
        }
    })
}

export function getWorkspaceDotsLabel() {
    const items = listWorkspaceCards()
    if (items.length === 0) return "•"
    return items.map((workspace) => (workspace.active ? "●" : "•")).join(" ")
}

export function switchWorkspace(id: number) {
    if (!Number.isFinite(id) || id <= 0) return
    runCommand(`hyprctl dispatch workspace ${Math.floor(id)}`)
    closePanel()
}
