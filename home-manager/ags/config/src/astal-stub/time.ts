export type TAccessor<T> = {
  (): T;
  subscribe(cb: () => void): () => void;
};

export function createPoll<T>(
  init: T,
  interval: number,
  exec: string | string[],
  transform?: (stdout: string, prev: T) => T,
): TAccessor<T>;
export function createPoll<T>(
  init: T,
  interval: number,
  fn: (prev: T) => T | Promise<T>,
): TAccessor<T>;
export function createPoll<T>(
  init: T,
  interval: number,
  execOrFn: string | string[] | ((prev: T) => T | Promise<T>),
  transform?: (stdout: string, prev: T) => T,
): TAccessor<T> {
  return (() => init) as TAccessor<T>;
}
