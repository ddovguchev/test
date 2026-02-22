import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";
import { overlayWindows } from "./windows";

function runCmd(cmd: string): () => void {
  return () => {
    try {
      const fullCmd = `PATH="/run/current-system/sw/bin:/usr/bin:$PATH" ${cmd}`;
      GLib.spawn_async(null, ["sh", "-c", fullCmd], null, GLib.SpawnFlags.SEARCH_PATH, null);
    } catch (e) {
      console.error("runCmd", cmd, e);
    }
  };
}

export default function PowerMenu(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  return (
    <window
      name="powermenu"
      visible={false}
      setup={(self) => overlayWindows.set("powermenu", self as Gtk.Window)}
      cssClasses={["MenuOverlay"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
      widthRequest={900}
      heightRequest={600}
    >
      <centerbox>
        <box />
        <box cssName="menu-overlay-block" orientation={1} spacing={8} widthRequest={900} heightRequest={600}>
          <label label="Power" cssName="appmenu-title" />
          <button cssName="bar-btn" onClicked={runCmd("systemctl poweroff")}>
            <label label="Shutdown" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("systemctl reboot")}>
            <label label="Reboot" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch exit")}>
            <label label="Logout" />
          </button>
        </box>
        <box />
      </centerbox>
    </window>
  ) as JSX.Element;
}
