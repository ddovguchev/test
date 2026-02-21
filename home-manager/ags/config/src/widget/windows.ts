import type Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";
import app from "astal/gtk4/app";

export const overlayWindows = new Map<string, Gtk.Window>();

function findWindowByName(name: string): Gtk.Window | null {
  const w = overlayWindows.get(name);
  if (w) return w;
  const wins = (app as { get_windows?: () => Gtk.Window[] }).get_windows?.();
  if (wins) {
    for (const win of wins) {
      if ((win as { name?: string }).name === name) return win;
    }
  }
  return null;
}

export function toggleWindow(name: string): () => void {
  return () => {
    const w = findWindowByName(name);
    if (w) {
      try {
        (w as { visible: boolean }).visible = !(w as { visible: boolean }).visible;
      } catch {
        runAgsToggle(name);
      }
    } else {
      runAgsToggle(name);
    }
  };
}

function runAgsToggle(name: string): void {
  const cmd = `ags --toggle-window "${name}"`;
  GLib.spawn_async(null, ["sh", "-c", cmd], null, GLib.SpawnFlags.SEARCH_PATH, null);
}
