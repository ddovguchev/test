import app from "astal/gtk4/app";
import { Astal, type Gdk } from "astal/gtk4";
import Clock from "./Clock";

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
      <box cssName="bar">
        <box cssName="bar-left" />
        <box cssName="bar-center" />
        <box cssName="bar-right">
          <Clock />
        </box>
      </box>
    </window>
  );
}
