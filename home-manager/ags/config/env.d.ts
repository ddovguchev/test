declare const SRC: string

declare module "astal" {
    export interface VariableValue<T> {
        (): T
        set(value: T): void
        poll(intervalMs: number, command: string): VariableValue<string>
        subscribe(callback: (value: T) => void): void
    }

    export interface VariableFactory {
        <T>(initialValue: T): VariableValue<T>
    }

    export const Variable: VariableFactory
}

declare module "astal/gtk3" {
    export namespace Gdk {
        interface Monitor {}
    }

    export namespace Gtk {
        enum Align {
            CENTER = 3,
        }
        namespace Image {
            function new_from_file(path: string): any
        }
    }

    export namespace Astal {
        enum Exclusivity {
            EXCLUSIVE,
            IGNORE,
        }
        enum Keymode {
            ON_DEMAND,
            EXCLUSIVE,
            NONE,
        }
        enum WindowAnchor {
            TOP = 1,
            BOTTOM = 2,
            LEFT = 4,
            RIGHT = 8,
        }
    }

    export interface AppStartParams {
        css?: string
        requestHandler?(request: string): string
        main(): void
    }

    export const App: {
        start(params: AppStartParams): void
        get_monitors(): Gdk.Monitor[]
    }
}

declare module "astal/gtk3/jsx-runtime" {
    export function jsx(type: unknown, props: unknown, key?: unknown): unknown
    export function jsxs(type: unknown, props: unknown, key?: unknown): unknown
    export const Fragment: unknown
}

declare module "gi://Gio" {
    export interface AppInfo {
        should_show(): boolean
        get_display_name(): string | null
        get_name(): string | null
        launch(files: unknown[], context: unknown): boolean
    }

    export interface AppInfoStatic {
        get_all(): AppInfo[]
    }

    const Gio: {
        AppInfo: AppInfoStatic
    }
    export default Gio
}

declare module "gi://GLib" {
    const GLib: any
    export default GLib
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: Record<string, unknown>
    }
}

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

declare module "*.svg" {
    const content: string
    export default content
}
