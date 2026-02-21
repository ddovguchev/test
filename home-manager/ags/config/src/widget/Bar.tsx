import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
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

type RevealerRef = { current: { set_reveal_child: (reveal: boolean) => void } | null };

function hideAll(refs: { apps: RevealerRef; notif: RevealerRef; power: RevealerRef }): void {
  refs.apps.current?.set_reveal_child(false);
  refs.notif.current?.set_reveal_child(false);
  refs.power.current?.set_reveal_child(false);
}

export default function Bar(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  const appsRevealerRef: RevealerRef = { current: null };
  const notifRevealerRef: RevealerRef = { current: null };
  const powerRevealerRef: RevealerRef = { current: null };
  const refs = { apps: appsRevealerRef, notif: notifRevealerRef, power: powerRevealerRef };

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
            <button
              cssName="bar-btn"
              onClicked={() => {
                hideAll(refs);
                appsRevealerRef.current?.set_reveal_child(true);
              }}
            >
              <label label="Apps" />
            </button>
          </box>
          <box hexpand halign={3} orientation={0}>
            <SysMonitor />
            <button
              cssName="bar-btn"
              onClicked={() => {
                hideAll(refs);
                notifRevealerRef.current?.set_reveal_child(true);
              }}
            >
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
            <button
              cssName="bar-btn"
              onClicked={() => {
                hideAll(refs);
                powerRevealerRef.current?.set_reveal_child(true);
              }}
            >
              <label label="Power" />
            </button>
          </box>
          <label label="     " />
        </box>

        <revealer ref={appsRevealerRef} reveal_child={false} cssName="panel-revealer">
          <box
            cssName="apps-panel"
            orientation={1}
            widthRequest={APPS_PANEL_WIDTH}
            heightRequest={APPS_PANEL_HEIGHT}
          >
            <box orientation={0} cssName="panel-header">
              <button
                cssName="bar-btn"
                onClicked={() => appsRevealerRef.current?.set_reveal_child(false)}
              >
                <label label="← Back" />
              </button>
            </box>
            <box orientation={1} hexpand>
              <label label="Apps" cssName="panel-title" />
              <label label="(placeholder)" />
            </box>
          </box>
        </revealer>

        <revealer ref={notifRevealerRef} reveal_child={false} cssName="panel-revealer">
          <box cssName="notif-panel" orientation={1} widthRequest={400} heightRequest={500}>
            <box orientation={0} cssName="panel-header">
              <button
                cssName="bar-btn"
                onClicked={() => notifRevealerRef.current?.set_reveal_child(false)}
              >
                <label label="← Back" />
              </button>
            </box>
            <label label="Notifications (placeholder)" />
          </box>
        </revealer>

        <revealer ref={powerRevealerRef} reveal_child={false} cssName="panel-revealer">
          <box cssName="power-panel" orientation={1} widthRequest={300} heightRequest={400}>
            <box orientation={0} cssName="panel-header">
              <button
                cssName="bar-btn"
                onClicked={() => powerRevealerRef.current?.set_reveal_child(false)}
              >
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
