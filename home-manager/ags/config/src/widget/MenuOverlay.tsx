import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import type Gtk from "gi://Gtk?version=4.0";
import { overlayWindows } from "./windows";

export default function MenuOverlay(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  return (
    <window
      name="menuoverlay"
      visible={false}
      setup={(self) => overlayWindows.set("menuoverlay", self as Gtk.Window)}
      cssClasses={["MenuOverlay"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box />
        <box cssName="menu-overlay-block" orientation={1} widthRequest={900} heightRequest={600}>
          <label label="Apps" cssName="appmenu-title" />
        </box>
        <box />
      </centerbox>
    </window>
  ) as JSX.Element;
}
