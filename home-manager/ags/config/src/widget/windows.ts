import type Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";

export const overlayWindows = new Map<string, Gtk.Window>();

export function toggleWindow(name: string): () => void {
  return () => {
    const w = overlayWindows.get(name);
    if (w) {
      w.visible = !w.visible;
    } else {
      // Fallback: spawn ags toggle if window not registered yet
      const cmd = `ags toggle ${name}`;
      GLib.spawn_async(null, ["sh", "-c", cmd], null, GLib.SpawnFlags.SEARCH_PATH, null);
    }
  };
}
