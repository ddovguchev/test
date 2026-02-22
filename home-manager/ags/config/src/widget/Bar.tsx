import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import Gtk from "gi://Gtk?version=4.0";
import GLib from "gi://GLib?version=2.0";
import { createPoll } from "astal/time";
import Clock from "./Clock";
import SysMonitor from "./SysMonitor";
import { toggleWindow } from "./windows";

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

const workspaceData = createPoll(
  { ids: [1, 2, 3, 4, 5, 6, 7, 8, 9], active: 1 },
  500,
  [
    "sh",
    "-c",
    'ids=$(hyprctl workspaces -j 2>/dev/null | jq -r "[.[].id] | sort | unique | .[]" 2>/dev/null | tr "\\n" " "); [ -z "$ids" ] && ids="1 2 3 4 5 6 7 8 9"; active=$(hyprctl activeworkspace -j 2>/dev/null | jq -r ".id" 2>/dev/null); echo "$ids|${active:-1}"',
  ],
  (out, prev) => {
    try {
      const [idsStr, activeStr] = out.trim().split("|");
      const ids = (idsStr?.match(/\d+/g) ?? ["1", "2", "3", "4", "5", "6", "7", "8", "9"])
        .map(Number)
        .filter((n) => n >= 1 && n <= 9)
        .sort((a, b) => a - b);
      const uniq = [...new Set(ids)];
      const active = parseInt(activeStr ?? "1", 10) || 1;
      return { ids: uniq.length > 0 ? uniq : [1, 2, 3, 4, 5, 6, 7, 8, 9], active };
    } catch {
      return prev;
    }
  },
);

function Workspaces(): JSX.Element {
  const data = workspaceData();
  const ids = data?.ids ?? [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const active = data?.active ?? 1;
  return (
    <box orientation={0}>
      {ids.map((id) => (
        <button
          cssName={id === active ? "bar-btn workspace-active" : "bar-btn"}
          onClicked={runCmd(`hyprctl dispatch workspace ${id}`)}
        >
          <label label={String(id)} />
        </button>
      ))}
    </box>
  ) as JSX.Element;
}

export default function Bar(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <box cssName="bar" orientation={0}>
        <label label="     " />
        <box halign={1} orientation={0} spacing={12}>
          <Clock />
          <label label="│" cssName="bar-separator" />
          <button cssName="bar-btn nixos-btn" onClicked={toggleWindow("menuoverlay")}>
            <Gtk.Image iconName="nix-snowflake" />
          </button>
          <label label="│" cssName="bar-separator" />
          <Workspaces />
        </box>
        <box hexpand halign={3} orientation={0}>
          <SysMonitor />
        </box>
        <box halign={2} orientation={0} spacing={12}>
          <box orientation={0}>
            <button cssName="bar-btn" onClicked={toggleWindow("notification")}>
              <label label="Notifications" />
            </button>
          </box>
          <box orientation={0}>
            <button cssName="bar-btn" onClicked={toggleWindow("powermenu")}>
              <label label="⏻" cssName="bar-power-icon" />
            </button>
          </box>
        </box>
        <label label="     " />
      </box>
    </window>
  ) as JSX.Element;
}
