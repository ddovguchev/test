import { App, Astal, Gtk, type Gdk } from "astal/gtk4";
import { Variable } from "astal";

const time = Variable("").poll(1000, "date");

export default function Bar(gdkmonitor: Gdk.Monitor): ReturnType<typeof Astal.Window> {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={App}
    >
      <box cssName="bar-row" hexpand>
        <box cssName="bar-left" />
        <box cssName="bar-center" hexpand halign={Gtk.Align.CENTER}>
          <label label={time()} />
        </box>
        <box cssName="bar-right" />
      </box>
    </window>
  );
}
