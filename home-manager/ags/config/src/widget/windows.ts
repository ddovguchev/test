import type Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";

export const overlayWindows = new Map<string, Gtk.Window>();

export function toggleWindow(name: string): () => void {
  return () => runAgsToggle(name);
}

function runAgsToggle(name: string): void {
  const path = `PATH="${GLib.getenv("HOME") || "/tmp"}/.nix-profile/bin:/run/current-system/sw/bin:/usr/bin:${GLib.getenv("PATH") || ""}`;
  const cmd = `${path} ags --toggle-window "${name}"`;
  GLib.spawn_async(null, ["sh", "-c", cmd], null, GLib.SpawnFlags.SEARCH_PATH, null);
}
