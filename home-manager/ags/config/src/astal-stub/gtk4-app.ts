export interface IStartConfig {
  css?: string;
  main?: (...argv: string[]) => void;
}

export interface IAppInstance {
  get_monitors(): unknown[];
  start(config: IStartConfig): void;
}

const app: IAppInstance = {} as IAppInstance;
