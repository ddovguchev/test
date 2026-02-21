import { App } from "astal/gtk4";
import style from "./style.scss";
import Bar from "./widget/Bar";

type TMonitor = Parameters<typeof Bar>[0];

type TAppWithMonitors = {
  get_monitors: () => TMonitor[];
  start: (cfg: { css: string; main: () => void; }) => void;
};

(App as unknown as TAppWithMonitors).start({
  css: style,
  main() {
    (App as unknown as TAppWithMonitors).get_monitors().map(Bar);
  },
});
