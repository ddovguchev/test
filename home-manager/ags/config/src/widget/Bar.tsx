import app from "astal/gtk4/app";
import { Astal, Gtk, type Gdk } from "astal/gtk4";
import { createPoll } from "astal/time";

const clock = createPoll("", 1000, "date");

export default function Bar(gdkmonitor: Gdk.Monitor): ReturnType<typeof Astal.Window> {
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
      <box cssName="bar-row" hexpand>
        <box cssName="bar-left" />
        <box cssName="bar-center" hexpand halign={Gtk.Align.CENTER}>
          <label label={clock} />
        </box>
        <box cssName="bar-right" />
      </box>
    </window>
  );
}
