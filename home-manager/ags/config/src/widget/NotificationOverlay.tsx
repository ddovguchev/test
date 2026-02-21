import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import type Gtk from "gi://Gtk?version=4.0";
import { overlayWindows } from "./windows";

export default function NotificationOverlay(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  return (
    <window
      name="notification"
      visible={false}
      setup={(self) => overlayWindows.set("notification", self as Gtk.Window)}
      cssClasses={["MenuOverlay"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box />
        <box orientation={1} spacing={8} widthRequest={900} heightRequest={600}>
          <button onClicked={() => {}}>
            <label label="Notifications" />
          </button>
        </box>
        <box />
      </centerbox>
    </window>
  ) as JSX.Element;
}
