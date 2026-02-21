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
      <box cssName="bar" orientation={0}>
        <label label="     " />
        <box halign={1}>
          <Clock />
        </box>
        <box hexpand halign={3} orientation={0}>
          <Clock />
        </box>
        <box hexpand halign={3} orientation={0}>
          <Clock />
        </box>
        <box halign={2}>
          <Clock />
        </box>
        <label label="     " />
      </box>
    </window>
  );
}
