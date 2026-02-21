declare module "astal/gtk4/app" {
  interface IStartConfig {
    css?: string;
    main?: (...argv: string[]) => void;
  }
  interface IAppInstance {
    get_monitors(): unknown[];
    start(config: IStartConfig): void;
  }
  const app: IAppInstance;
  export default app;
}

type TReactiveLabel = string | { (): string; subscribe(cb: () => void): () => void; };

declare module "astal/gtk4" {
  export namespace Gdk {
    interface Monitor {
      width: number;
      height: number;
    }
  }
  export const Astal: {
    Window: new (props: unknown) => unknown;
    WindowAnchor: { TOP: number; BOTTOM: number; LEFT: number; RIGHT: number };
    Exclusivity: { EXCLUSIVE: number; NORMAL: number };
  };
  namespace JSX {
    interface IntrinsicElements {
      window: Record<string, unknown>;
      box: Record<string, unknown> & { widthRequest?: number; heightRequest?: number };
      centerbox: Record<string, unknown>;
      revealer: Record<string, unknown> & { reveal_child?: boolean | unknown };
      button: Record<string, unknown> & { onClicked?: string | (() => void) };
      label: Record<string, unknown> & {
        label?: TReactiveLabel;
      };
    }
    interface ILabelAttributes {
      label?: TReactiveLabel;
    }
  }
}

declare module "astal/time" {
  type TAccessor<T> = { (): T; subscribe(cb: () => void): () => void; };
  function createPoll<T>(
    init: T,
    interval: number,
    exec: string | string[],
    transform?: (stdout: string, prev: T) => T,
  ): TAccessor<T>;
  function createPoll<T>(
    init: T,
    interval: number,
    fn: (prev: T) => T | Promise<T>,
  ): TAccessor<T>;
  export { createPoll };
}
