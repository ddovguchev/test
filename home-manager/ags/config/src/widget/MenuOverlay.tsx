import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";

export default function MenuOverlay(gdkmonitor: Gdk.Monitor): JSX.Element {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;
  return (
    <window
      name="menuoverlay"
      visible={false}
      cssClasses={["MenuOverlay"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox>
        <box />
        <box cssName="menu-overlay-block" widthRequest={500} heightRequest={500} />
        <box />
      </centerbox>
    </window>
  ) as JSX.Element;
}
