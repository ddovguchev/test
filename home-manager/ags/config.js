"use strict";

import GLib from "gi://GLib";
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

const CONFIG_DIR = GLib.get_user_config_dir() + "/ags";

// Часы
const Clock = () =>
  Widget.Label({
    class_name: "clock",
  }).poll(1000, (self) => {
    try {
      self.label = Utils.exec('date "+%H:%M"');
    } catch (_) {
      self.label = "--:--";
    }
  });

// Рабочие столы 1–5 (без hyprctl при старте — только клик)
const WorkspaceButtons = () => {
  const buttons = [];
  for (let id = 1; id <= 5; id++) {
    buttons.push(
      Widget.Button({
        class_name: "workspace-btn",
        child: Widget.Label({ label: String(id), class_name: "workspace-label" }),
        onClicked: () => Utils.execAsync(["hyprctl", "dispatch", "workspace", String(id)]).catch(print),
      })
    );
  }
  // Подсветка активного через 1 сек после старта (когда hyprland уже готов)
  Utils.timeout(1000, () => {
    Utils.interval(1000, () => {
      try {
        const out = Utils.exec("hyprctl activeworkspace -j 2>/dev/null || echo '{\"id\":1}'");
        const id = JSON.parse(out).id || 1;
        buttons.forEach((btn, i) => btn.toggleClassName("active", id === i + 1));
      } catch (_) {}
    });
  });
  return Widget.Box({ class_name: "workspaces", spacing: 6, children: buttons });
};

const Bar = () =>
  Widget.Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      start_widget: Widget.Box({ class_name: "bar-left", spacing: 12, children: [WorkspaceButtons()] }),
      center_widget: Widget.Box(),
      end_widget: Widget.Box({ class_name: "bar-right", children: [Clock()] }),
    }),
  });

App.config({
  style: CONFIG_DIR + "/style.css",
  windows: [Bar()],
});
