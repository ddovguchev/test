import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";

export default function AppMenu(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT } = Astal.WindowAnchor;
  return (
    <window
      name="appmenu"
      visible={false}
      cssClasses={["AppMenu"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT}
      application={app}
      widthRequest={320}
      heightRequest={400}
    >
      <box orientation={1} cssName="appmenu-content">
        <label label="Apps" cssName="appmenu-title" />
        <label label="" />
      </box>
    </window>
  ) as JSX.Element;
}
