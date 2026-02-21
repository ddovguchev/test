import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import Gio from "gi://Gio?version=2.0";
import Clock from "./Clock";
import SysMonitor from "./SysMonitor";

function runCmd(cmd: string): () => void {
  return () => {
    try {
      Gio.Subprocess.new(["sh", "-c", cmd], Gio.SubprocessFlags.NONE);
    } catch (e) {
      console.error("runCmd", cmd, e);
    }
  };
}

const menuContentProps = {
  orientation: 1 as const,
  cssName: "bar-menu-content",
  widthRequest: 280,
  heightRequest: 320,
};

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
            <popover cssName="apps-menu" hasArrow={false}>
              <box {...menuContentProps} />
            </popover>
            <label label="Apps" />
          </menubutton>
        </box>
        <box hexpand halign={3} orientation={0}>
          <SysMonitor />
          <menubutton cssName="bar-btn">
            <popover cssName="notifications-menu" hasArrow={false}>
              <box {...menuContentProps} />
            </popover>
            <label label="Notifications" />
          </menubutton>
        </box>
        <box hexpand halign={3} orientation={0}>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch workspace 1")}>
            <label label="1" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch workspace 2")}>
            <label label="2" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch workspace 3")}>
            <label label="3" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch workspace 4")}>
            <label label="4" />
          </button>
          <button cssName="bar-btn" onClicked={runCmd("hyprctl dispatch workspace 5")}>
            <label label="5" />
          </button>
        </box>
        <box halign={2} orientation={0}>
          <menubutton cssName="bar-btn">
            <popover cssName="power-menu" hasArrow={false}>
              <box {...menuContentProps} />
            </popover>
            <label label="Power" />
          </menubutton>
        </box>
        <label label="     " />
      </box>
    </window>
  ) as JSX.Element;
}
