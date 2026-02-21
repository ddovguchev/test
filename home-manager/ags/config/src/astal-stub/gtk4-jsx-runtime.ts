/** Stub for typecheck only; paths resolve astal/gtk4/jsx-runtime here. */

declare global {
  namespace JSX {
    type Element = unknown;
    interface IntrinsicElements {
      window: Record<string, unknown>;
      box: Record<string, unknown>;
      centerbox: Record<string, unknown>;
      button: Record<string, unknown> & { onClicked?: string };
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
