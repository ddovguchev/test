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
declare module "gi://GLib?version=2.0" {
  export enum SpawnFlags {
    SEARCH_PATH = 1,
  }
  export function spawn_async(
    working_directory: string | null,
    argv: string[],
    envp: string[] | null,
    flags: SpawnFlags,
    child_setup: (() => void) | null,
  ): [boolean, number];
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
