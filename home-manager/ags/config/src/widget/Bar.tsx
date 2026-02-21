import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import Variable from "astal/variable";
import Gio from "gi://Gio?version=2.0";
import Clock from "./Clock";
import SysMonitor from "./SysMonitor";

const APPS_PANEL_WIDTH = 500;
const APPS_PANEL_HEIGHT = 800;

function runCmd(cmd: string): () => void {
  return () => {
    try {
      Gio.Subprocess.new(["sh", "-c", cmd], Gio.SubprocessFlags.NONE);
    } catch (e) {
      console.error("runCmd", cmd, e);
    }
  };
}

export default function Bar(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  const appsRevealed = Variable(false);
  const notifRevealed = Variable(false);
  const powerRevealed = Variable(false);

  function showApps(): void {
    notifRevealed.set(false);
    powerRevealed.set(false);
    appsRevealed.set(true);
  }
  function showNotif(): void {
    appsRevealed.set(false);
    powerRevealed.set(false);
    notifRevealed.set(true);
  }
  function showPower(): void {
    appsRevealed.set(false);
    notifRevealed.set(false);
    powerRevealed.set(true);
  }

  return (
    <window
      visible
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <box cssName="bar-root" orientation={1}>
        <box cssName="bar" orientation={0}>
          <label label="     " />
          <box halign={1} orientation={0}>
            <Clock />
            <button cssName="bar-btn" onClicked={showApps}>
              <label label="Apps" />
            </button>
          </box>
          <box hexpand halign={3} orientation={0}>
            <SysMonitor />
            <button cssName="bar-btn" onClicked={showNotif}>
              <label label="Notifications" />
            </button>
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
            <button cssName="bar-btn" onClicked={showPower}>
              <label label="Power" />
            </button>
          </box>
          <label label="     " />
        </box>

        <revealer reveal_child={appsRevealed.bind()} cssName="panel-revealer">
          <box
            cssName="apps-panel"
            orientation={1}
            widthRequest={APPS_PANEL_WIDTH}
            heightRequest={APPS_PANEL_HEIGHT}
          >
            <box orientation={0} cssName="panel-header">
              <button cssName="bar-btn" onClicked={() => appsRevealed.set(false)}>
                <label label="← Back" />
              </button>
            </box>
            <box orientation={1} hexpand>
              <label label="Apps" cssName="panel-title" />
              <label label="(placeholder)" />
            </box>
          </box>
        </revealer>

        <revealer reveal_child={notifRevealed.bind()} cssName="panel-revealer">
          <box cssName="notif-panel" orientation={1} widthRequest={400} heightRequest={500}>
            <box orientation={0} cssName="panel-header">
              <button cssName="bar-btn" onClicked={() => notifRevealed.set(false)}>
                <label label="← Back" />
              </button>
            </box>
            <label label="Notifications (placeholder)" />
          </box>
        </revealer>

        <revealer reveal_child={powerRevealed.bind()} cssName="panel-revealer">
          <box cssName="power-panel" orientation={1} widthRequest={300} heightRequest={400}>
            <box orientation={0} cssName="panel-header">
              <button cssName="bar-btn" onClicked={() => powerRevealed.set(false)}>
                <label label="← Back" />
              </button>
            </box>
            <label label="Power (placeholder)" />
          </box>
        </revealer>
      </box>
    </window>
  ) as JSX.Element;
}
