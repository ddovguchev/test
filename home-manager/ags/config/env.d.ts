declare const SRC: string

declare module "inline:*" {
    const content: string
    export default content
}

declare module "*.scss" {
    const content: string
    export default content
}

declare module "*.blp" {
    const content: string
    export default content
}

declare module "*.css" {
    const content: string
    export default content
}

declare module "astal/gtk4/app" {
  interface StartConfig {
    css?: string
    main?: (...argv: string[]) => void
  }
  interface AppInstance {
    get_monitors(): unknown[]
    start(config: StartConfig): void
  }
  const app: AppInstance
  export default app
}

declare module "astal/time" {
  type Accessor<T> = { (): T; subscribe(cb: () => void): () => void }
  function createPoll<T>(
    init: T,
    interval: number,
    exec: string | string[],
    transform?: (stdout: string, prev: T) => T
  ): Accessor<T>
  function createPoll<T>(
    init: T,
    interval: number,
    fn: (prev: T) => T | Promise<T>
  ): Accessor<T>
  export { createPoll }
}
