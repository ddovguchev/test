"use strict";

import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

const { exec } = Utils;

// Workspace buttons (1–5), poll active workspace from hyprctl
const WorkspaceButtons = () => {
  const buttons = [];
  for (let id = 1; id <= 5; id++) {
    buttons.push(
      Widget.Button({
        class_name: "workspace-btn",
        child: Widget.Label({
          label: `${id}`,
          class_name: "workspace-label",
        }),
        onClicked: () => {
          Utils.execAsync([
            "hyprctl",
            "dispatch",
            "workspace",
            `${id}`,
          ]).catch(print);
        },
      })
    );
  }

  const box = Widget.Box({
    class_name: "workspaces",
    spacing: 6,
    children: buttons,
  });

  Utils.interval(500, () => {
    try {
      const json = JSON.parse(
        exec("hyprctl activeworkspace -j 2>/dev/null || echo '{\"id\":1}'")
      );
      const activeId = json.id ?? 1;
      buttons.forEach((btn, i) => {
        btn.toggleClassName("active", activeId === i + 1);
      });
    } catch (e) {}
  });

  return box;
};

// Clock — update every second
const Clock = () =>
  Widget.Label({
    class_name: "clock",
  }).poll(1000, (self) => {
    self.label = exec('date "+%H:%M"');
  });

const Bar = () =>
  Widget.Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    child: Widget.CenterBox({
      start_widget: Widget.Box({
        class_name: "bar-left",
        spacing: 12,
        children: [WorkspaceButtons()],
      }),
      center_widget: Widget.Box(),
      end_widget: Widget.Box({
        class_name: "bar-right",
        children: [Clock()],
      }),
    }),
  });

App.config({
  style: App.configDir + "/style.css",
  windows: [Bar()],
});
