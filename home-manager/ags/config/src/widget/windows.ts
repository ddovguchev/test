import type Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";

export const overlayWindows = new Map<string, Gtk.Window>();

export function toggleWindow(name: string): () => void {
  return () => {
    const w = overlayWindows.get(name);
    if (w) {
      try {
        const v = (w as { visible: boolean }).visible;
        (w as { visible: boolean }).visible = !v;
      } catch (e) {
        console.error("toggle in-process failed", name, e);
        runAgsToggle(name);
      }
    } else {
      runAgsToggle(name);
    }
  };
}

function runAgsToggle(name: string): void {
  try {
    const agsBin = (globalThis as { AGS_BIN?: string }).AGS_BIN || "ags";
    const cmd = `"${agsBin}" --toggle-window "${name}"`;
    GLib.spawn_async(null, ["sh", "-c", cmd], null, GLib.SpawnFlags.SEARCH_PATH, null);
  } catch (e) {
    console.error("toggle CLI failed", name, e);
  }
}
