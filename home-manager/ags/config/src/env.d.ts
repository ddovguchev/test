declare const SRC: string;

declare module "inline:*" {
  const content: string;
  export default content;
}

declare module "*.scss" {
  const content: string;
  export default content;
}

declare module "*.blp" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: string;
  export default content;
}

/* eslint-disable rulesdir/specified-exports -- ambient module declarations use named exports */
declare module "ags/variable" {
  interface IVariableBinding {
    subscribe(fn: (v: boolean) => void): () => void;
    get(): boolean;
  }
  interface IVariableApi<T> {
    get(): T;
    set(v: T): void;
    bind(): IVariableBinding;
  }
  function Variable<T>(initial: T): IVariableApi<T>;
  export default Variable;
}

declare module "gi://Gio?version=2.0" {
  export enum SubprocessFlags {
    NONE = 0,
  }
  export class Subprocess {
    static new(argv: string[], flags: SubprocessFlags): Subprocess;
  }
  const Gio: { Subprocess: typeof Subprocess; SubprocessFlags: typeof SubprocessFlags; };
  export default Gio;
}
