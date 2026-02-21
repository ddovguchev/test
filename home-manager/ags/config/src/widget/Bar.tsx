import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import GLib from "gi://GLib?version=2.0";
import Clock from "./Clock";
import SysMonitor from "./SysMonitor";

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
        <box halign={1} orientation={0}>
          <Clock />
          <menubutton cssName="bar-btn">
            <popover cssName="apps-menu">
              <box orientation={1} cssName="bar-menu-content">
                <label label="Apps" cssName="menu-title" />
                <button cssName="menu-item" onClicked={runCmd("firefox")}>
                  <label label="Firefox" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("kitty")}>
                  <label label="Terminal" />
                </button>
              </box>
            </popover>
            <label label="Apps" />
          </menubutton>
        </box>
        <box hexpand halign={3} orientation={0}>
          <SysMonitor />
          <menubutton cssName="bar-btn">
            <popover cssName="notifications-menu">
              <box orientation={1} cssName="bar-menu-content">
                <label label="Notifications" cssName="menu-title" />
                <label label="No notifications" />
              </box>
            </popover>
            <label label="Notifications" />
          </menubutton>
        </box>
        <box hexpand halign={3} orientation={0}>
          <menubutton cssName="bar-btn">
            <popover cssName="workspaces-menu">
              <box orientation={0} cssName="bar-menu-content workspaces-grid">
                <button cssName="menu-item" onClicked={runCmd("hyprctl dispatch workspace 1")}>
                  <label label="1" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("hyprctl dispatch workspace 2")}>
                  <label label="2" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("hyprctl dispatch workspace 3")}>
                  <label label="3" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("hyprctl dispatch workspace 4")}>
                  <label label="4" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("hyprctl dispatch workspace 5")}>
                  <label label="5" />
                </button>
              </box>
            </popover>
            <label label="Workspaces" />
          </menubutton>
        </box>
        <box halign={2} orientation={0}>
          <menubutton cssName="bar-btn">
            <popover cssName="power-menu">
              <box orientation={1} cssName="bar-menu-content">
                <label label="Session" cssName="menu-title" />
                <button cssName="menu-item" onClicked={runCmd("loginctl lock-session")}>
                  <label label="Lock" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("loginctl terminate-user $USER")}>
                  <label label="Logout" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("systemctl suspend")}>
                  <label label="Sleep" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("systemctl reboot")}>
                  <label label="Reboot" />
                </button>
                <button cssName="menu-item" onClicked={runCmd("systemctl poweroff")}>
                  <label label="Power off" />
                </button>
              </box>
            </popover>
            <label label="Power" />
          </menubutton>
        </box>
        <label label="     " />
      </box>
    </window>
  ) as JSX.Element;
}
