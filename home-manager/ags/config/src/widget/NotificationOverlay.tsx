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
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
      widthRequest={900}
      heightRequest={600}
    >
      <centerbox>
        <box />
        <box cssName="menu-overlay-block" orientation={1} widthRequest={900} heightRequest={600}>
          <label label="Notifications" cssName="appmenu-title" />
        </box>
        <box />
      </centerbox>
    </window>
  ) as JSX.Element;
}
