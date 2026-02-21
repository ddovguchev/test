/** Stub for typecheck only; paths resolve astal/gtk4/jsx-runtime here. */

declare global {
  namespace JSX {
    type Element = unknown;
    interface IntrinsicElements {
      window: Record<string, unknown>;
      box: Record<string, unknown> & { widthRequest?: number; heightRequest?: number };
      centerbox: Record<string, unknown>;
      revealer: Record<string, unknown> & { reveal_child?: boolean | unknown };
      button: Record<string, unknown> & { onClicked?: string | (() => void) };
      label: Record<string, unknown> & {
        label?: string | { (): string; subscribe(cb: () => void): () => void };
      };
    }
  }
}

export function jsx(type: unknown, props: unknown, key?: unknown): unknown {
  return null;
}
export function jsxDEV(type: unknown, props: unknown, key?: unknown): unknown {
  return null;
}
