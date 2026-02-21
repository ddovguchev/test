// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk4/index.ts
import Astal6 from "gi://Astal?version=4.0";
import Gtk4 from "gi://Gtk?version=4.0";
import Gdk2 from "gi://Gdk?version=4.0";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/variable.ts
import Astal3 from "gi://AstalIO";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/binding.ts
import GObject from "gi://GObject";
var snakeify = (str) => str.replace(/([a-z])([A-Z])/g, "$1_$2").replaceAll("-", "_").toLowerCase();
var kebabify = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase();
var Binding = class _Binding {
  transformFn = (v) => v;
  #emitter;
  #prop;
  static bind(emitter, prop) {
    return new _Binding(emitter, prop);
  }
  constructor(emitter, prop) {
    this.#emitter = emitter;
    this.#prop = prop && kebabify(prop);
  }
  [Symbol.toPrimitive]() {
    console.warn("Binding implicitly converted to a primitive value. This is almost always a mistake.");
    return this.toString();
  }
  /**
   * This function is mostly here to aid in debugging.
   * It returns a regular, non-reactive string,
   * and will not work to reactively use a binding somewhere that expects a plain string.
   */
  toString() {
    return `Binding<${this.#emitter}${this.#prop ? `, "${this.#prop}"` : ""}>`;
  }
  /**
   * Create a new binding that additionally applies a function on its value.
   * @param fn The transformation to apply. This should be a pure function, as it can be called at any time.
   */
  as(fn) {
    const bind2 = new _Binding(this.#emitter, this.#prop);
    bind2.transformFn = (v) => fn(this.transformFn(v));
    return bind2;
  }
  /**
   * Get the binding's current value (non-reactively).
   */
  get() {
    if (typeof this.#emitter.get === "function")
      return this.transformFn(this.#emitter.get());
    if (typeof this.#prop === "string") {
      const getter = `get_${snakeify(this.#prop)}`;
      if (typeof this.#emitter[getter] === "function")
        return this.transformFn(this.#emitter[getter]());
      return this.transformFn(this.#emitter[this.#prop]);
    }
    throw Error("can not get value of binding");
  }
  subscribe(callback) {
    if (typeof this.#emitter.subscribe === "function") {
      return this.#emitter.subscribe(() => {
        callback(this.get());
      });
    } else if (typeof this.#emitter.connect === "function") {
      const signal = `notify::${this.#prop}`;
      const id = this.#emitter.connect(signal, () => {
        callback(this.get());
      });
      return () => {
        if (GObject.signal_handler_is_connected(this.#emitter, id))
          this.#emitter.disconnect(id);
      };
    }
    throw Error(`${this.#emitter} is not bindable`);
  }
};
var { bind } = Binding;
var binding_default = Binding;

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/time.ts
import Astal from "gi://AstalIO";
var Time = Astal.Time;
function interval(interval2, callback) {
  return Astal.Time.interval(interval2, () => void callback?.());
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/process.ts
import Astal2 from "gi://AstalIO";
var Process = Astal2.Process;
function subprocess(argsOrCmd, onOut = print, onErr = printerr) {
  const args = Array.isArray(argsOrCmd) || typeof argsOrCmd === "string";
  const { cmd, err, out } = {
    cmd: args ? argsOrCmd : argsOrCmd.cmd,
    err: args ? onErr : argsOrCmd.err || onErr,
    out: args ? onOut : argsOrCmd.out || onOut
  };
  const proc = Array.isArray(cmd) ? Astal2.Process.subprocessv(cmd) : Astal2.Process.subprocess(cmd);
  proc.connect("stdout", (_, stdout) => out(stdout));
  proc.connect("stderr", (_, stderr) => err(stderr));
  return proc;
}
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(cmd)) {
      Astal2.Process.exec_asyncv(cmd, (_, res) => {
        try {
          resolve(Astal2.Process.exec_asyncv_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    } else {
      Astal2.Process.exec_async(cmd, (_, res) => {
        try {
          resolve(Astal2.Process.exec_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/variable.ts
var VariableWrapper = class extends Function {
  variable;
  errHandler = console.error;
  _value;
  _poll;
  _watch;
  pollInterval = 1e3;
  pollExec;
  pollTransform;
  pollFn;
  watchTransform;
  watchExec;
  constructor(init) {
    super();
    this._value = init;
    this.variable = new Astal3.VariableBase();
    this.variable.connect("dropped", () => {
      this.stopWatch();
      this.stopPoll();
    });
    this.variable.connect("error", (_, err) => this.errHandler?.(err));
    return new Proxy(this, {
      apply: (target, _, args) => target._call(args[0])
    });
  }
  _call(transform) {
    const b = binding_default.bind(this);
    return transform ? b.as(transform) : b;
  }
  toString() {
    return String(`Variable<${this.get()}>`);
  }
  get() {
    return this._value;
  }
  set(value) {
    if (value !== this._value) {
      this._value = value;
      this.variable.emit("changed");
    }
  }
  startPoll() {
    if (this._poll)
      return;
    if (this.pollFn) {
      this._poll = interval(this.pollInterval, () => {
        const v = this.pollFn(this.get());
        if (v instanceof Promise) {
          v.then((v2) => this.set(v2)).catch((err) => this.variable.emit("error", err));
        } else {
          this.set(v);
        }
      });
    } else if (this.pollExec) {
      this._poll = interval(this.pollInterval, () => {
        execAsync(this.pollExec).then((v) => this.set(this.pollTransform(v, this.get()))).catch((err) => this.variable.emit("error", err));
      });
    }
  }
  startWatch() {
    if (this._watch)
      return;
    this._watch = subprocess({
      cmd: this.watchExec,
      out: (out) => this.set(this.watchTransform(out, this.get())),
      err: (err) => this.variable.emit("error", err)
    });
  }
  stopPoll() {
    this._poll?.cancel();
    delete this._poll;
  }
  stopWatch() {
    this._watch?.kill();
    delete this._watch;
  }
  isPolling() {
    return !!this._poll;
  }
  isWatching() {
    return !!this._watch;
  }
  drop() {
    this.variable.emit("dropped");
  }
  onDropped(callback) {
    this.variable.connect("dropped", callback);
    return this;
  }
  onError(callback) {
    delete this.errHandler;
    this.variable.connect("error", (_, err) => callback(err));
    return this;
  }
  subscribe(callback) {
    const id = this.variable.connect("changed", () => {
      callback(this.get());
    });
    return () => this.variable.disconnect(id);
  }
  poll(interval2, exec, transform = (out) => out) {
    this.stopPoll();
    this.pollInterval = interval2;
    this.pollTransform = transform;
    if (typeof exec === "function") {
      this.pollFn = exec;
      delete this.pollExec;
    } else {
      this.pollExec = exec;
      delete this.pollFn;
    }
    this.startPoll();
    return this;
  }
  watch(exec, transform = (out) => out) {
    this.stopWatch();
    this.watchExec = exec;
    this.watchTransform = transform;
    this.startWatch();
    return this;
  }
  observe(objs, sigOrFn, callback) {
    const f = typeof sigOrFn === "function" ? sigOrFn : callback ?? (() => this.get());
    const set = (obj, ...args) => this.set(f(obj, ...args));
    if (Array.isArray(objs)) {
      for (const obj of objs) {
        const [o, s] = obj;
        const id = o.connect(s, set);
        this.onDropped(() => o.disconnect(id));
      }
    } else {
      if (typeof sigOrFn === "string") {
        const id = objs.connect(sigOrFn, set);
        this.onDropped(() => objs.disconnect(id));
      }
    }
    return this;
  }
  static derive(deps, fn = (...args) => args) {
    const update = () => fn(...deps.map((d) => d.get()));
    const derived = new Variable(update());
    const unsubs = deps.map((dep) => dep.subscribe(() => derived.set(update())));
    derived.onDropped(() => unsubs.map((unsub) => unsub()));
    return derived;
  }
};
var Variable = new Proxy(VariableWrapper, {
  apply: (_t, _a, args) => new VariableWrapper(args[0])
});
var { derive } = Variable;
var variable_default = Variable;

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/_astal.ts
var noImplicitDestroy = Symbol("no no implicit destroy");
var setChildren = Symbol("children setter method");
function mergeBindings(array) {
  function getValues(...args) {
    let i = 0;
    return array.map(
      (value) => value instanceof binding_default ? args[i++] : value
    );
  }
  const bindings = array.filter((i) => i instanceof binding_default);
  if (bindings.length === 0)
    return array;
  if (bindings.length === 1)
    return bindings[0].as(getValues);
  return variable_default.derive(bindings, getValues)();
}
function setProp(obj, prop, value) {
  try {
    const setter = `set_${snakeify(prop)}`;
    if (typeof obj[setter] === "function")
      return obj[setter](value);
    return obj[prop] = value;
  } catch (error) {
    console.error(`could not set property "${prop}" on ${obj}:`, error);
  }
}
function hook(widget, object, signalOrCallback, callback) {
  if (typeof object.connect === "function" && callback) {
    const id = object.connect(signalOrCallback, (_, ...args) => {
      return callback(widget, ...args);
    });
    widget.connect("destroy", () => {
      object.disconnect(id);
    });
  } else if (typeof object.subscribe === "function" && typeof signalOrCallback === "function") {
    const unsub = object.subscribe((...args) => {
      signalOrCallback(widget, ...args);
    });
    widget.connect("destroy", unsub);
  }
}
function construct(widget, config) {
  let { setup, child, children = [], ...props } = config;
  if (children instanceof binding_default) {
    children = [children];
  }
  if (child) {
    children.unshift(child);
  }
  for (const [key, value] of Object.entries(props)) {
    if (value === void 0) {
      delete props[key];
    }
  }
  const bindings = Object.keys(props).reduce((acc, prop) => {
    if (props[prop] instanceof binding_default) {
      const binding = props[prop];
      delete props[prop];
      return [...acc, [prop, binding]];
    }
    return acc;
  }, []);
  const onHandlers = Object.keys(props).reduce((acc, key) => {
    if (key.startsWith("on")) {
      const sig = kebabify(key).split("-").slice(1).join("-");
      const handler = props[key];
      delete props[key];
      return [...acc, [sig, handler]];
    }
    return acc;
  }, []);
  const mergedChildren = mergeBindings(children.flat(Infinity));
  if (mergedChildren instanceof binding_default) {
    widget[setChildren](mergedChildren.get());
    widget.connect("destroy", mergedChildren.subscribe((v) => {
      widget[setChildren](v);
    }));
  } else {
    if (mergedChildren.length > 0) {
      widget[setChildren](mergedChildren);
    }
  }
  for (const [signal, callback] of onHandlers) {
    const sig = signal.startsWith("notify") ? signal.replace("-", "::") : signal;
    if (typeof callback === "function") {
      widget.connect(sig, callback);
    } else {
      widget.connect(sig, () => execAsync(callback).then(print).catch(console.error));
    }
  }
  for (const [prop, binding] of bindings) {
    if (prop === "child" || prop === "children") {
      widget.connect("destroy", binding.subscribe((v) => {
        widget[setChildren](v);
      }));
    }
    widget.connect("destroy", binding.subscribe((v) => {
      setProp(widget, prop, v);
    }));
    setProp(widget, prop, binding.get());
  }
  for (const [key, value] of Object.entries(props)) {
    if (value === void 0) {
      delete props[key];
    }
  }
  Object.assign(widget, props);
  setup?.(widget);
  return widget;
}
function isArrowFunction(func) {
  return !Object.hasOwn(func, "prototype");
}
function jsx(ctors2, ctor, { children, ...props }) {
  children ??= [];
  if (!Array.isArray(children))
    children = [children];
  children = children.filter(Boolean);
  if (children.length === 1)
    props.child = children[0];
  else if (children.length > 1)
    props.children = children;
  if (typeof ctor === "string") {
    if (isArrowFunction(ctors2[ctor]))
      return ctors2[ctor](props);
    return new ctors2[ctor](props);
  }
  if (isArrowFunction(ctor))
    return ctor(props);
  return new ctor(props);
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk4/astalify.ts
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
var type = Symbol("child type");
var dummyBulder = new Gtk.Builder();
function _getChildren(widget) {
  if ("get_child" in widget && typeof widget.get_child == "function") {
    return widget.get_child() ? [widget.get_child()] : [];
  }
  const children = [];
  let ch = widget.get_first_child();
  while (ch !== null) {
    children.push(ch);
    ch = ch.get_next_sibling();
  }
  return children;
}
function _setChildren(widget, children) {
  children = children.flat(Infinity).map((ch) => ch instanceof Gtk.Widget ? ch : new Gtk.Label({ visible: true, label: String(ch) }));
  for (const child of children) {
    widget.vfunc_add_child(
      dummyBulder,
      child,
      type in child ? child[type] : null
    );
  }
}
function astalify(cls, config = {}) {
  Object.assign(cls.prototype, {
    [setChildren](children) {
      const w = this;
      for (const child of config.getChildren?.(w) || _getChildren(w)) {
        if (child instanceof Gtk.Widget) {
          child.unparent();
          if (!children.includes(child) && noImplicitDestroy in this)
            child.run_dispose();
        }
      }
      if (config.setChildren) {
        config.setChildren(w, children);
      } else {
        _setChildren(w, children);
      }
    }
  });
  return {
    [cls.name]: (props = {}, ...children) => {
      const widget = new cls("cssName" in props ? { cssName: props.cssName } : {});
      if ("cssName" in props) {
        delete props.cssName;
      }
      if (props.noImplicitDestroy) {
        Object.assign(widget, { [noImplicitDestroy]: true });
        delete props.noImplicitDestroy;
      }
      if (props.type) {
        Object.assign(widget, { [type]: props.type });
        delete props.type;
      }
      if (children.length > 0) {
        Object.assign(props, { children });
      }
      return construct(widget, setupControllers(widget, props));
    }
  }[cls.name];
}
function setupControllers(widget, {
  onFocusEnter,
  onFocusLeave,
  onKeyPressed,
  onKeyReleased,
  onKeyModifier,
  onLegacy,
  onButtonPressed,
  onButtonReleased,
  onHoverEnter,
  onHoverLeave,
  onMotion,
  onScroll,
  onScrollDecelerate,
  ...props
}) {
  if (onFocusEnter || onFocusLeave) {
    const focus = new Gtk.EventControllerFocus();
    widget.add_controller(focus);
    if (onFocusEnter)
      focus.connect("enter", () => onFocusEnter(widget));
    if (onFocusLeave)
      focus.connect("leave", () => onFocusLeave(widget));
  }
  if (onKeyPressed || onKeyReleased || onKeyModifier) {
    const key = new Gtk.EventControllerKey();
    widget.add_controller(key);
    if (onKeyPressed)
      key.connect("key-pressed", (_, val, code, state) => onKeyPressed(widget, val, code, state));
    if (onKeyReleased)
      key.connect("key-released", (_, val, code, state) => onKeyReleased(widget, val, code, state));
    if (onKeyModifier)
      key.connect("modifiers", (_, state) => onKeyModifier(widget, state));
  }
  if (onLegacy || onButtonPressed || onButtonReleased) {
    const legacy = new Gtk.EventControllerLegacy();
    widget.add_controller(legacy);
    legacy.connect("event", (_, event) => {
      if (event.get_event_type() === Gdk.EventType.BUTTON_PRESS) {
        onButtonPressed?.(widget, event);
      }
      if (event.get_event_type() === Gdk.EventType.BUTTON_RELEASE) {
        onButtonReleased?.(widget, event);
      }
      onLegacy?.(widget, event);
    });
  }
  if (onMotion || onHoverEnter || onHoverLeave) {
    const hover = new Gtk.EventControllerMotion();
    widget.add_controller(hover);
    if (onHoverEnter)
      hover.connect("enter", (_, x, y) => onHoverEnter(widget, x, y));
    if (onHoverLeave)
      hover.connect("leave", () => onHoverLeave(widget));
    if (onMotion)
      hover.connect("motion", (_, x, y) => onMotion(widget, x, y));
  }
  if (onScroll || onScrollDecelerate) {
    const scroll = new Gtk.EventControllerScroll();
    scroll.flags = Gtk.EventControllerScrollFlags.BOTH_AXES | Gtk.EventControllerScrollFlags.KINETIC;
    widget.add_controller(scroll);
    if (onScroll)
      scroll.connect("scroll", (_, x, y) => onScroll(widget, x, y));
    if (onScrollDecelerate)
      scroll.connect("decelerate", (_, x, y) => onScrollDecelerate(widget, x, y));
  }
  return props;
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk4/app.ts
import GLib from "gi://GLib?version=2.0";
import Gtk2 from "gi://Gtk?version=4.0";
import Astal4 from "gi://Astal?version=4.0";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/overrides.ts
var snakeify2 = (str) => str.replace(/([a-z])([A-Z])/g, "$1_$2").replaceAll("-", "_").toLowerCase();
async function suppress(mod, patch2) {
  return mod.then((m) => patch2(m.default)).catch(() => void 0);
}
function patch(proto, prop) {
  Object.defineProperty(proto, prop, {
    get() {
      return this[`get_${snakeify2(prop)}`]();
    }
  });
}
await suppress(import("gi://AstalApps"), ({ Apps, Application }) => {
  patch(Apps.prototype, "list");
  patch(Application.prototype, "keywords");
  patch(Application.prototype, "categories");
});
await suppress(import("gi://AstalBattery"), ({ UPower }) => {
  patch(UPower.prototype, "devices");
});
await suppress(import("gi://AstalBluetooth"), ({ Adapter, Bluetooth, Device }) => {
  patch(Adapter.prototype, "uuids");
  patch(Bluetooth.prototype, "adapters");
  patch(Bluetooth.prototype, "devices");
  patch(Device.prototype, "uuids");
});
await suppress(import("gi://AstalHyprland"), ({ Hyprland, Monitor, Workspace }) => {
  patch(Hyprland.prototype, "binds");
  patch(Hyprland.prototype, "monitors");
  patch(Hyprland.prototype, "workspaces");
  patch(Hyprland.prototype, "clients");
  patch(Monitor.prototype, "availableModes");
  patch(Monitor.prototype, "available_modes");
  patch(Workspace.prototype, "clients");
});
await suppress(import("gi://AstalMpris"), ({ Mpris, Player }) => {
  patch(Mpris.prototype, "players");
  patch(Player.prototype, "supported_uri_schemes");
  patch(Player.prototype, "supportedUriSchemes");
  patch(Player.prototype, "supported_mime_types");
  patch(Player.prototype, "supportedMimeTypes");
  patch(Player.prototype, "comments");
});
await suppress(import("gi://AstalNetwork"), ({ Wifi }) => {
  patch(Wifi.prototype, "access_points");
  patch(Wifi.prototype, "accessPoints");
});
await suppress(import("gi://AstalNotifd"), ({ Notifd, Notification }) => {
  patch(Notifd.prototype, "notifications");
  patch(Notification.prototype, "actions");
});
await suppress(import("gi://AstalPowerProfiles"), ({ PowerProfiles }) => {
  patch(PowerProfiles.prototype, "actions");
});
await suppress(import("gi://AstalWp"), ({ Wp, Audio, Video, Node, Endpoint, Device }) => {
  patch(Wp.prototype, "nodes");
  patch(Wp.prototype, "devices");
  patch(Audio.prototype, "streams");
  patch(Audio.prototype, "recorders");
  patch(Audio.prototype, "microphones");
  patch(Audio.prototype, "speakers");
  patch(Audio.prototype, "devices");
  patch(Video.prototype, "streams");
  patch(Video.prototype, "recorders");
  patch(Video.prototype, "sinks");
  patch(Video.prototype, "sources");
  patch(Video.prototype, "devices");
  patch(Endpoint.prototype, "routes");
  patch(Node.prototype, "channels");
  patch(Device.prototype, "profiles");
  patch(Device.prototype, "routes");
});

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/_app.ts
import { setConsoleLogDomain } from "console";
import { exit, programArgs } from "system";
import IO from "gi://AstalIO";
import GObject2 from "gi://GObject";
function mkApp(App) {
  return new class AstalJS extends App {
    static {
      GObject2.registerClass({ GTypeName: "AstalJS" }, this);
    }
    eval(body) {
      return new Promise((res, rej) => {
        try {
          const fn = Function(`return (async function() {
                        ${body.includes(";") ? body : `return ${body};`}
                    })`);
          fn()().then(res).catch(rej);
        } catch (error) {
          rej(error);
        }
      });
    }
    requestHandler;
    vfunc_request(msg, conn) {
      if (typeof this.requestHandler === "function") {
        this.requestHandler(msg, (response) => {
          IO.write_sock(
            conn,
            String(response),
            (_, res) => IO.write_sock_finish(res)
          );
        });
      } else {
        super.vfunc_request(msg, conn);
      }
    }
    apply_css(style, reset = false) {
      super.apply_css(style, reset);
    }
    quit(code) {
      super.quit();
      exit(code ?? 0);
    }
    start({ requestHandler, css, hold, main, client, icons, ...cfg } = {}) {
      const app = this;
      client ??= () => {
        print(`Astal instance "${app.instanceName}" already running`);
        exit(1);
      };
      Object.assign(this, cfg);
      setConsoleLogDomain(app.instanceName);
      this.requestHandler = requestHandler;
      app.connect("activate", () => {
        main?.(...programArgs);
      });
      try {
        app.acquire_socket();
      } catch (error) {
        return client((msg) => IO.send_request(app.instanceName, msg), ...programArgs);
      }
      if (css)
        this.apply_css(css, false);
      if (icons)
        app.add_icons(icons);
      hold ??= true;
      if (hold)
        app.hold();
      app.runAsync([]);
    }
  }();
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk4/app.ts
Gtk2.init();
GLib.unsetenv("LD_PRELOAD");
await import("gi://Adw?version=1").then(({ default: Adw }) => Adw.init()).catch(() => void 0);
var app_default = mkApp(Astal4.Application);

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk4/widget.ts
import Astal5 from "gi://Astal?version=4.0";
import Gtk3 from "gi://Gtk?version=4.0";
function filter(children) {
  return children.flat(Infinity).map((ch) => ch instanceof Gtk3.Widget ? ch : new Gtk3.Label({ visible: true, label: String(ch) }));
}
Object.defineProperty(Astal5.Box.prototype, "children", {
  get() {
    return this.get_children();
  },
  set(v) {
    this.set_children(v);
  }
});
var Box = astalify(Astal5.Box, {
  getChildren(self) {
    return self.get_children();
  },
  setChildren(self, children) {
    return self.set_children(filter(children));
  }
});
var Button = astalify(Gtk3.Button);
var CenterBox = astalify(Gtk3.CenterBox, {
  getChildren(box) {
    return [box.startWidget, box.centerWidget, box.endWidget];
  },
  setChildren(box, children) {
    const ch = filter(children);
    box.startWidget = ch[0] || new Gtk3.Box();
    box.centerWidget = ch[1] || new Gtk3.Box();
    box.endWidget = ch[2] || new Gtk3.Box();
  }
});
var Entry = astalify(Gtk3.Entry, {
  getChildren() {
    return [];
  }
});
var Image = astalify(Gtk3.Image, {
  getChildren() {
    return [];
  }
});
var Label = astalify(Gtk3.Label, {
  getChildren() {
    return [];
  },
  setChildren(self, children) {
    self.label = String(children);
  }
});
var LevelBar = astalify(Gtk3.LevelBar, {
  getChildren() {
    return [];
  }
});
var Overlay = astalify(Gtk3.Overlay, {
  getChildren(self) {
    const children = [];
    let ch = self.get_first_child();
    while (ch !== null) {
      children.push(ch);
      ch = ch.get_next_sibling();
    }
    return children.filter((ch2) => ch2 !== self.child);
  },
  setChildren(self, children) {
    for (const child of filter(children)) {
      const types = type in child ? child[type].split(/\s+/) : [];
      if (types.includes("overlay")) {
        self.add_overlay(child);
      } else {
        self.set_child(child);
      }
      self.set_measure_overlay(child, types.includes("measure"));
      self.set_clip_overlay(child, types.includes("clip"));
    }
  }
});
var Revealer = astalify(Gtk3.Revealer);
var Slider = astalify(Astal5.Slider, {
  getChildren() {
    return [];
  }
});
var Stack = astalify(Gtk3.Stack, {
  setChildren(self, children) {
    for (const child of filter(children)) {
      if (child.name != "" && child.name != null) {
        self.add_named(child, child.name);
      } else {
        self.add_child(child);
      }
    }
  }
});
var Switch = astalify(Gtk3.Switch, {
  getChildren() {
    return [];
  }
});
var Window = astalify(Astal5.Window);
var MenuButton = astalify(Gtk3.MenuButton, {
  getChildren(self) {
    return [self.popover, self.child];
  },
  setChildren(self, children) {
    for (const child of filter(children)) {
      if (child instanceof Gtk3.Popover) {
        self.set_popover(child);
      } else {
        self.set_child(child);
      }
    }
  }
});
var Popover = astalify(Gtk3.Popover);

// sass:/home/hikari/nixos-flake/home-manager/ags/config/src/style.scss
var style_default = "window.Bar {\n  background: transparent;\n  color: @theme_fg_color;\n  font-weight: bold;\n}\nwindow.Bar > centerbox {\n  background: @theme_bg_color;\n  border-radius: 10px;\n  margin: 8px;\n}\nwindow.Bar button {\n  border-radius: 8px;\n  margin: 2px;\n}";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/index.ts
import { default as default3 } from "gi://AstalIO?version=0.1";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/file.ts
import Astal7 from "gi://AstalIO";
import Gio from "gi://Gio?version=2.0";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gobject.ts
import GObject3 from "gi://GObject";
import { default as default2 } from "gi://GLib?version=2.0";
var meta = Symbol("meta");
var priv = Symbol("priv");
var { ParamSpec, ParamFlags } = GObject3;

// src/i18n.ts
function t(key) {
  const messages = {
    "welcome": "Welcome to AGS!"
  };
  return messages[key] ?? key;
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk3/widget.ts
import Astal9 from "gi://Astal?version=3.0";
import Gtk6 from "gi://Gtk?version=3.0";
import GObject5 from "gi://GObject";

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk3/astalify.ts
import Astal8 from "gi://Astal?version=3.0";
import Gtk5 from "gi://Gtk?version=3.0";
import GObject4 from "gi://GObject";
function astalify2(cls, clsName = cls.name) {
  class Widget extends cls {
    get css() {
      return Astal8.widget_get_css(this);
    }
    set css(css) {
      Astal8.widget_set_css(this, css);
    }
    get_css() {
      return this.css;
    }
    set_css(css) {
      this.css = css;
    }
    get className() {
      return Astal8.widget_get_class_names(this).join(" ");
    }
    set className(className) {
      Astal8.widget_set_class_names(this, className.split(/\s+/));
    }
    get_class_name() {
      return this.className;
    }
    set_class_name(className) {
      this.className = className;
    }
    get cursor() {
      return Astal8.widget_get_cursor(this);
    }
    set cursor(cursor) {
      Astal8.widget_set_cursor(this, cursor);
    }
    get_cursor() {
      return this.cursor;
    }
    set_cursor(cursor) {
      this.cursor = cursor;
    }
    get clickThrough() {
      return Astal8.widget_get_click_through(this);
    }
    set clickThrough(clickThrough) {
      Astal8.widget_set_click_through(this, clickThrough);
    }
    get_click_through() {
      return this.clickThrough;
    }
    set_click_through(clickThrough) {
      this.clickThrough = clickThrough;
    }
    get noImplicitDestroy() {
      return this[noImplicitDestroy];
    }
    set noImplicitDestroy(value) {
      this[noImplicitDestroy] = value;
    }
    set actionGroup([prefix, group]) {
      this.insert_action_group(prefix, group);
    }
    set_action_group(actionGroup) {
      this.actionGroup = actionGroup;
    }
    getChildren() {
      if (this instanceof Gtk5.Bin) {
        return this.get_child() ? [this.get_child()] : [];
      } else if (this instanceof Gtk5.Container) {
        return this.get_children();
      }
      return [];
    }
    setChildren(children) {
      children = children.flat(Infinity).map((ch) => ch instanceof Gtk5.Widget ? ch : new Gtk5.Label({ visible: true, label: String(ch) }));
      if (this instanceof Gtk5.Container) {
        for (const ch of children)
          this.add(ch);
      } else {
        throw Error(`can not add children to ${this.constructor.name}`);
      }
    }
    [setChildren](children) {
      if (this instanceof Gtk5.Container) {
        for (const ch of this.getChildren()) {
          this.remove(ch);
          if (!children.includes(ch) && !this.noImplicitDestroy)
            ch?.destroy();
        }
      }
      this.setChildren(children);
    }
    toggleClassName(cn, cond = true) {
      Astal8.widget_toggle_class_name(this, cn, cond);
    }
    hook(object, signalOrCallback, callback) {
      hook(this, object, signalOrCallback, callback);
      return this;
    }
    constructor(...params) {
      super();
      const props = params[0] || {};
      props.visible ??= true;
      construct(this, props);
    }
  }
  GObject4.registerClass({
    GTypeName: `Astal_${clsName}`,
    Properties: {
      "class-name": GObject4.ParamSpec.string(
        "class-name",
        "",
        "",
        GObject4.ParamFlags.READWRITE,
        ""
      ),
      "css": GObject4.ParamSpec.string(
        "css",
        "",
        "",
        GObject4.ParamFlags.READWRITE,
        ""
      ),
      "cursor": GObject4.ParamSpec.string(
        "cursor",
        "",
        "",
        GObject4.ParamFlags.READWRITE,
        "default"
      ),
      "click-through": GObject4.ParamSpec.boolean(
        "click-through",
        "",
        "",
        GObject4.ParamFlags.READWRITE,
        false
      ),
      "no-implicit-destroy": GObject4.ParamSpec.boolean(
        "no-implicit-destroy",
        "",
        "",
        GObject4.ParamFlags.READWRITE,
        false
      )
    }
  }, Widget);
  return Widget;
}

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk3/widget.ts
function filter2(children) {
  return children.flat(Infinity).map((ch) => ch instanceof Gtk6.Widget ? ch : new Gtk6.Label({ visible: true, label: String(ch) }));
}
Object.defineProperty(Astal9.Box.prototype, "children", {
  get() {
    return this.get_children();
  },
  set(v) {
    this.set_children(v);
  }
});
var Box2 = class extends astalify2(Astal9.Box) {
  static {
    GObject5.registerClass({ GTypeName: "Box" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
  setChildren(children) {
    this.set_children(filter2(children));
  }
};
var Button2 = class extends astalify2(Astal9.Button) {
  static {
    GObject5.registerClass({ GTypeName: "Button" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var CenterBox2 = class extends astalify2(Astal9.CenterBox) {
  static {
    GObject5.registerClass({ GTypeName: "CenterBox" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
  setChildren(children) {
    const ch = filter2(children);
    this.startWidget = ch[0] || new Gtk6.Box();
    this.centerWidget = ch[1] || new Gtk6.Box();
    this.endWidget = ch[2] || new Gtk6.Box();
  }
};
var CircularProgress = class extends astalify2(Astal9.CircularProgress) {
  static {
    GObject5.registerClass({ GTypeName: "CircularProgress" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var DrawingArea = class extends astalify2(Gtk6.DrawingArea) {
  static {
    GObject5.registerClass({ GTypeName: "DrawingArea" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Entry2 = class extends astalify2(Gtk6.Entry) {
  static {
    GObject5.registerClass({ GTypeName: "Entry" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var EventBox = class extends astalify2(Astal9.EventBox) {
  static {
    GObject5.registerClass({ GTypeName: "EventBox" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Icon = class extends astalify2(Astal9.Icon) {
  static {
    GObject5.registerClass({ GTypeName: "Icon" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Label2 = class extends astalify2(Astal9.Label) {
  static {
    GObject5.registerClass({ GTypeName: "Label" }, this);
  }
  constructor(props) {
    super(props);
  }
  setChildren(children) {
    this.label = String(children);
  }
};
var LevelBar2 = class extends astalify2(Astal9.LevelBar) {
  static {
    GObject5.registerClass({ GTypeName: "LevelBar" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var MenuButton2 = class extends astalify2(Gtk6.MenuButton) {
  static {
    GObject5.registerClass({ GTypeName: "MenuButton" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
Object.defineProperty(Astal9.Overlay.prototype, "overlays", {
  get() {
    return this.get_overlays();
  },
  set(v) {
    this.set_overlays(v);
  }
});
var Overlay2 = class extends astalify2(Astal9.Overlay) {
  static {
    GObject5.registerClass({ GTypeName: "Overlay" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
  setChildren(children) {
    const [child, ...overlays] = filter2(children);
    this.set_child(child);
    this.set_overlays(overlays);
  }
};
var Revealer2 = class extends astalify2(Gtk6.Revealer) {
  static {
    GObject5.registerClass({ GTypeName: "Revealer" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Scrollable = class extends astalify2(Astal9.Scrollable) {
  static {
    GObject5.registerClass({ GTypeName: "Scrollable" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};
var Slider2 = class extends astalify2(Astal9.Slider) {
  static {
    GObject5.registerClass({ GTypeName: "Slider" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Stack2 = class extends astalify2(Astal9.Stack) {
  static {
    GObject5.registerClass({ GTypeName: "Stack" }, this);
  }
  constructor(props, ...children) {
    super({ children, ...props });
  }
  setChildren(children) {
    this.set_children(filter2(children));
  }
};
var Switch2 = class extends astalify2(Gtk6.Switch) {
  static {
    GObject5.registerClass({ GTypeName: "Switch" }, this);
  }
  constructor(props) {
    super(props);
  }
};
var Window2 = class extends astalify2(Astal9.Window) {
  static {
    GObject5.registerClass({ GTypeName: "Window" }, this);
  }
  constructor(props, child) {
    super({ child, ...props });
  }
};

// ../../../../../../nix/store/4rb4bqjjrlcly7hdp605p7jhaj48r7aa-astal-gjs-0-unstable-2025-11-26/share/astal/gjs/gtk3/jsx-runtime.ts
function jsx2(ctor, props) {
  return jsx(ctors, ctor, props);
}
var ctors = {
  box: Box2,
  button: Button2,
  centerbox: CenterBox2,
  circularprogress: CircularProgress,
  drawingarea: DrawingArea,
  entry: Entry2,
  eventbox: EventBox,
  // TODO: fixed
  // TODO: flowbox
  icon: Icon,
  label: Label2,
  levelbar: LevelBar2,
  // TODO: listbox
  menubutton: MenuButton2,
  overlay: Overlay2,
  revealer: Revealer2,
  scrollable: Scrollable,
  slider: Slider2,
  stack: Stack2,
  switch: Switch2,
  window: Window2
};
var jsxs = jsx2;

// src/widget/Bar.tsx
var time = Variable("").poll(1e3, "date");
function Bar(gdkmonitor) {
  const { TOP, LEFT, RIGHT } = Astal6.WindowAnchor;
  return /* @__PURE__ */ jsx2(
    "window",
    {
      visible: true,
      cssClasses: ["Bar"],
      gdkmonitor,
      exclusivity: Astal6.Exclusivity.EXCLUSIVE,
      anchor: TOP | LEFT | RIGHT,
      application: app_default,
      children: /* @__PURE__ */ jsxs("centerbox", { cssName: "centerbox", children: [
        /* @__PURE__ */ jsx2(
          "button",
          {
            onClicked: "echo hello",
            hexpand: true,
            halign: Gtk4.Align.CENTER,
            children: t("welcome")
          }
        ),
        /* @__PURE__ */ jsx2("box", {}),
        /* @__PURE__ */ jsxs(
          "menubutton",
          {
            hexpand: true,
            halign: Gtk4.Align.CENTER,
            children: [
              /* @__PURE__ */ jsx2("label", { label: time() }),
              /* @__PURE__ */ jsx2("popover", { children: /* @__PURE__ */ jsx2(Gtk4.Calendar, {}) })
            ]
          }
        )
      ] })
    }
  );
}

// src/app.ts
app_default.start({
  css: style_default,
  main() {
    app_default.get_monitors().map(Bar);
  }
});
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azQvaW5kZXgudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL3ZhcmlhYmxlLnRzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy9iaW5kaW5nLnRzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy90aW1lLnRzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy9wcm9jZXNzLnRzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy9fYXN0YWwudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azQvYXN0YWxpZnkudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azQvYXBwLnRzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy9vdmVycmlkZXMudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL19hcHAudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azQvd2lkZ2V0LnRzIiwgInNhc3M6L2hvbWUvaGlrYXJpL25peG9zLWZsYWtlL2hvbWUtbWFuYWdlci9hZ3MvY29uZmlnL3NyYy9zdHlsZS5zY3NzIiwgIi4uLy4uLy4uLy4uLy4uLy4uL25peC9zdG9yZS80cmI0YnFqanJsY2x5N2hkcDYwNXA3amhhajQ4cjdhYS1hc3RhbC1nanMtMC11bnN0YWJsZS0yMDI1LTExLTI2L3NoYXJlL2FzdGFsL2dqcy9pbmRleC50cyIsICIuLi8uLi8uLi8uLi8uLi8uLi9uaXgvc3RvcmUvNHJiNGJxampybGNseTdoZHA2MDVwN2poYWo0OHI3YWEtYXN0YWwtZ2pzLTAtdW5zdGFibGUtMjAyNS0xMS0yNi9zaGFyZS9hc3RhbC9nanMvZmlsZS50cyIsICIuLi8uLi8uLi8uLi8uLi8uLi9uaXgvc3RvcmUvNHJiNGJxampybGNseTdoZHA2MDVwN2poYWo0OHI3YWEtYXN0YWwtZ2pzLTAtdW5zdGFibGUtMjAyNS0xMS0yNi9zaGFyZS9hc3RhbC9nanMvZ29iamVjdC50cyIsICJzcmMvaTE4bi50cyIsICIuLi8uLi8uLi8uLi8uLi8uLi9uaXgvc3RvcmUvNHJiNGJxampybGNseTdoZHA2MDVwN2poYWo0OHI3YWEtYXN0YWwtZ2pzLTAtdW5zdGFibGUtMjAyNS0xMS0yNi9zaGFyZS9hc3RhbC9nanMvZ3RrMy93aWRnZXQudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azMvYXN0YWxpZnkudHMiLCAiLi4vLi4vLi4vLi4vLi4vLi4vbml4L3N0b3JlLzRyYjRicWpqcmxjbHk3aGRwNjA1cDdqaGFqNDhyN2FhLWFzdGFsLWdqcy0wLXVuc3RhYmxlLTIwMjUtMTEtMjYvc2hhcmUvYXN0YWwvZ2pzL2d0azMvanN4LXJ1bnRpbWUudHMiLCAic3JjL3dpZGdldC9CYXIudHN4IiwgInNyYy9hcHAudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCBBc3RhbCBmcm9tIFwiZ2k6Ly9Bc3RhbD92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgR2RrIGZyb20gXCJnaTovL0dkaz92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgYXN0YWxpZnksIHsgdHlwZSBDb25zdHJ1Y3RQcm9wcyB9IGZyb20gXCIuL2FzdGFsaWZ5LmpzXCJcblxuZXhwb3J0IHsgQXN0YWwsIEd0aywgR2RrIH1cbmV4cG9ydCB7IGRlZmF1bHQgYXMgQXBwIH0gZnJvbSBcIi4vYXBwLmpzXCJcbmV4cG9ydCB7IGFzdGFsaWZ5LCBDb25zdHJ1Y3RQcm9wcyB9XG5leHBvcnQgKiBhcyBXaWRnZXQgZnJvbSBcIi4vd2lkZ2V0LmpzXCJcbmV4cG9ydCB7IGhvb2sgfSBmcm9tIFwiLi4vX2FzdGFsXCJcbiIsICJpbXBvcnQgQXN0YWwgZnJvbSBcImdpOi8vQXN0YWxJT1wiXG5pbXBvcnQgQmluZGluZywgeyB0eXBlIENvbm5lY3RhYmxlLCB0eXBlIFN1YnNjcmliYWJsZSB9IGZyb20gXCIuL2JpbmRpbmcuanNcIlxuaW1wb3J0IHsgaW50ZXJ2YWwgfSBmcm9tIFwiLi90aW1lLmpzXCJcbmltcG9ydCB7IGV4ZWNBc3luYywgc3VicHJvY2VzcyB9IGZyb20gXCIuL3Byb2Nlc3MuanNcIlxuXG5jbGFzcyBWYXJpYWJsZVdyYXBwZXI8VD4gZXh0ZW5kcyBGdW5jdGlvbiB7XG4gICAgcHJpdmF0ZSB2YXJpYWJsZSE6IEFzdGFsLlZhcmlhYmxlQmFzZVxuICAgIHByaXZhdGUgZXJySGFuZGxlcj8gPSBjb25zb2xlLmVycm9yXG5cbiAgICBwcml2YXRlIF92YWx1ZTogVFxuICAgIHByaXZhdGUgX3BvbGw/OiBBc3RhbC5UaW1lXG4gICAgcHJpdmF0ZSBfd2F0Y2g/OiBBc3RhbC5Qcm9jZXNzXG5cbiAgICBwcml2YXRlIHBvbGxJbnRlcnZhbCA9IDEwMDBcbiAgICBwcml2YXRlIHBvbGxFeGVjPzogc3RyaW5nW10gfCBzdHJpbmdcbiAgICBwcml2YXRlIHBvbGxUcmFuc2Zvcm0/OiAoc3Rkb3V0OiBzdHJpbmcsIHByZXY6IFQpID0+IFRcbiAgICBwcml2YXRlIHBvbGxGbj86IChwcmV2OiBUKSA9PiBUIHwgUHJvbWlzZTxUPlxuXG4gICAgcHJpdmF0ZSB3YXRjaFRyYW5zZm9ybT86IChzdGRvdXQ6IHN0cmluZywgcHJldjogVCkgPT4gVFxuICAgIHByaXZhdGUgd2F0Y2hFeGVjPzogc3RyaW5nW10gfCBzdHJpbmdcblxuICAgIGNvbnN0cnVjdG9yKGluaXQ6IFQpIHtcbiAgICAgICAgc3VwZXIoKVxuICAgICAgICB0aGlzLl92YWx1ZSA9IGluaXRcbiAgICAgICAgdGhpcy52YXJpYWJsZSA9IG5ldyBBc3RhbC5WYXJpYWJsZUJhc2UoKVxuICAgICAgICB0aGlzLnZhcmlhYmxlLmNvbm5lY3QoXCJkcm9wcGVkXCIsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcFdhdGNoKClcbiAgICAgICAgICAgIHRoaXMuc3RvcFBvbGwoKVxuICAgICAgICB9KVxuICAgICAgICB0aGlzLnZhcmlhYmxlLmNvbm5lY3QoXCJlcnJvclwiLCAoXywgZXJyKSA9PiB0aGlzLmVyckhhbmRsZXI/LihlcnIpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHRoaXMsIHtcbiAgICAgICAgICAgIGFwcGx5OiAodGFyZ2V0LCBfLCBhcmdzKSA9PiB0YXJnZXQuX2NhbGwoYXJnc1swXSksXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY2FsbDxSID0gVD4odHJhbnNmb3JtPzogKHZhbHVlOiBUKSA9PiBSKTogQmluZGluZzxSPiB7XG4gICAgICAgIGNvbnN0IGIgPSBCaW5kaW5nLmJpbmQodGhpcylcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybSA/IGIuYXModHJhbnNmb3JtKSA6IGIgYXMgdW5rbm93biBhcyBCaW5kaW5nPFI+XG4gICAgfVxuXG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBTdHJpbmcoYFZhcmlhYmxlPCR7dGhpcy5nZXQoKX0+YClcbiAgICB9XG5cbiAgICBnZXQoKTogVCB7IHJldHVybiB0aGlzLl92YWx1ZSB9XG4gICAgc2V0KHZhbHVlOiBUKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWVcbiAgICAgICAgICAgIHRoaXMudmFyaWFibGUuZW1pdChcImNoYW5nZWRcIilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0UG9sbCgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BvbGwpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICBpZiAodGhpcy5wb2xsRm4pIHtcbiAgICAgICAgICAgIHRoaXMuX3BvbGwgPSBpbnRlcnZhbCh0aGlzLnBvbGxJbnRlcnZhbCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB0aGlzLnBvbGxGbiEodGhpcy5nZXQoKSlcbiAgICAgICAgICAgICAgICBpZiAodiBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdi50aGVuKHYgPT4gdGhpcy5zZXQodikpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goZXJyID0+IHRoaXMudmFyaWFibGUuZW1pdChcImVycm9yXCIsIGVycikpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXQodilcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucG9sbEV4ZWMpIHtcbiAgICAgICAgICAgIHRoaXMuX3BvbGwgPSBpbnRlcnZhbCh0aGlzLnBvbGxJbnRlcnZhbCwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGV4ZWNBc3luYyh0aGlzLnBvbGxFeGVjISlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4odiA9PiB0aGlzLnNldCh0aGlzLnBvbGxUcmFuc2Zvcm0hKHYsIHRoaXMuZ2V0KCkpKSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKGVyciA9PiB0aGlzLnZhcmlhYmxlLmVtaXQoXCJlcnJvclwiLCBlcnIpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXJ0V2F0Y2goKSB7XG4gICAgICAgIGlmICh0aGlzLl93YXRjaClcbiAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgIHRoaXMuX3dhdGNoID0gc3VicHJvY2Vzcyh7XG4gICAgICAgICAgICBjbWQ6IHRoaXMud2F0Y2hFeGVjISxcbiAgICAgICAgICAgIG91dDogb3V0ID0+IHRoaXMuc2V0KHRoaXMud2F0Y2hUcmFuc2Zvcm0hKG91dCwgdGhpcy5nZXQoKSkpLFxuICAgICAgICAgICAgZXJyOiBlcnIgPT4gdGhpcy52YXJpYWJsZS5lbWl0KFwiZXJyb3JcIiwgZXJyKSxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBzdG9wUG9sbCgpIHtcbiAgICAgICAgdGhpcy5fcG9sbD8uY2FuY2VsKClcbiAgICAgICAgZGVsZXRlIHRoaXMuX3BvbGxcbiAgICB9XG5cbiAgICBzdG9wV2F0Y2goKSB7XG4gICAgICAgIHRoaXMuX3dhdGNoPy5raWxsKClcbiAgICAgICAgZGVsZXRlIHRoaXMuX3dhdGNoXG4gICAgfVxuXG4gICAgaXNQb2xsaW5nKCkgeyByZXR1cm4gISF0aGlzLl9wb2xsIH1cbiAgICBpc1dhdGNoaW5nKCkgeyByZXR1cm4gISF0aGlzLl93YXRjaCB9XG5cbiAgICBkcm9wKCkge1xuICAgICAgICB0aGlzLnZhcmlhYmxlLmVtaXQoXCJkcm9wcGVkXCIpXG4gICAgfVxuXG4gICAgb25Ecm9wcGVkKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGUuY29ubmVjdChcImRyb3BwZWRcIiwgY2FsbGJhY2spXG4gICAgICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmFyaWFibGU8VD5cbiAgICB9XG5cbiAgICBvbkVycm9yKGNhbGxiYWNrOiAoZXJyOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZXJySGFuZGxlclxuICAgICAgICB0aGlzLnZhcmlhYmxlLmNvbm5lY3QoXCJlcnJvclwiLCAoXywgZXJyKSA9PiBjYWxsYmFjayhlcnIpKVxuICAgICAgICByZXR1cm4gdGhpcyBhcyB1bmtub3duIGFzIFZhcmlhYmxlPFQ+XG4gICAgfVxuXG4gICAgc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpIHtcbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLnZhcmlhYmxlLmNvbm5lY3QoXCJjaGFuZ2VkXCIsICgpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMuZ2V0KCkpXG4gICAgICAgIH0pXG4gICAgICAgIHJldHVybiAoKSA9PiB0aGlzLnZhcmlhYmxlLmRpc2Nvbm5lY3QoaWQpXG4gICAgfVxuXG4gICAgcG9sbChcbiAgICAgICAgaW50ZXJ2YWw6IG51bWJlcixcbiAgICAgICAgZXhlYzogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgICAgIHRyYW5zZm9ybT86IChzdGRvdXQ6IHN0cmluZywgcHJldjogVCkgPT4gVFxuICAgICk6IFZhcmlhYmxlPFQ+XG5cbiAgICBwb2xsKFxuICAgICAgICBpbnRlcnZhbDogbnVtYmVyLFxuICAgICAgICBjYWxsYmFjazogKHByZXY6IFQpID0+IFQgfCBQcm9taXNlPFQ+XG4gICAgKTogVmFyaWFibGU8VD5cblxuICAgIHBvbGwoXG4gICAgICAgIGludGVydmFsOiBudW1iZXIsXG4gICAgICAgIGV4ZWM6IHN0cmluZyB8IHN0cmluZ1tdIHwgKChwcmV2OiBUKSA9PiBUIHwgUHJvbWlzZTxUPiksXG4gICAgICAgIHRyYW5zZm9ybTogKHN0ZG91dDogc3RyaW5nLCBwcmV2OiBUKSA9PiBUID0gb3V0ID0+IG91dCBhcyBULFxuICAgICkge1xuICAgICAgICB0aGlzLnN0b3BQb2xsKClcbiAgICAgICAgdGhpcy5wb2xsSW50ZXJ2YWwgPSBpbnRlcnZhbFxuICAgICAgICB0aGlzLnBvbGxUcmFuc2Zvcm0gPSB0cmFuc2Zvcm1cbiAgICAgICAgaWYgKHR5cGVvZiBleGVjID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRoaXMucG9sbEZuID0gZXhlY1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMucG9sbEV4ZWNcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucG9sbEV4ZWMgPSBleGVjXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5wb2xsRm5cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0YXJ0UG9sbCgpXG4gICAgICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmFyaWFibGU8VD5cbiAgICB9XG5cbiAgICB3YXRjaChcbiAgICAgICAgZXhlYzogc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgICAgIHRyYW5zZm9ybTogKHN0ZG91dDogc3RyaW5nLCBwcmV2OiBUKSA9PiBUID0gb3V0ID0+IG91dCBhcyBULFxuICAgICkge1xuICAgICAgICB0aGlzLnN0b3BXYXRjaCgpXG4gICAgICAgIHRoaXMud2F0Y2hFeGVjID0gZXhlY1xuICAgICAgICB0aGlzLndhdGNoVHJhbnNmb3JtID0gdHJhbnNmb3JtXG4gICAgICAgIHRoaXMuc3RhcnRXYXRjaCgpXG4gICAgICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmFyaWFibGU8VD5cbiAgICB9XG5cbiAgICBvYnNlcnZlKFxuICAgICAgICBvYmpzOiBBcnJheTxbb2JqOiBDb25uZWN0YWJsZSwgc2lnbmFsOiBzdHJpbmddPixcbiAgICAgICAgY2FsbGJhY2s6ICguLi5hcmdzOiBhbnlbXSkgPT4gVCxcbiAgICApOiBWYXJpYWJsZTxUPlxuXG4gICAgb2JzZXJ2ZShcbiAgICAgICAgb2JqOiBDb25uZWN0YWJsZSxcbiAgICAgICAgc2lnbmFsOiBzdHJpbmcsXG4gICAgICAgIGNhbGxiYWNrOiAoLi4uYXJnczogYW55W10pID0+IFQsXG4gICAgKTogVmFyaWFibGU8VD5cblxuICAgIG9ic2VydmUoXG4gICAgICAgIG9ianM6IENvbm5lY3RhYmxlIHwgQXJyYXk8W29iajogQ29ubmVjdGFibGUsIHNpZ25hbDogc3RyaW5nXT4sXG4gICAgICAgIHNpZ09yRm46IHN0cmluZyB8ICgob2JqOiBDb25uZWN0YWJsZSwgLi4uYXJnczogYW55W10pID0+IFQpLFxuICAgICAgICBjYWxsYmFjaz86IChvYmo6IENvbm5lY3RhYmxlLCAuLi5hcmdzOiBhbnlbXSkgPT4gVCxcbiAgICApIHtcbiAgICAgICAgY29uc3QgZiA9IHR5cGVvZiBzaWdPckZuID09PSBcImZ1bmN0aW9uXCIgPyBzaWdPckZuIDogY2FsbGJhY2sgPz8gKCgpID0+IHRoaXMuZ2V0KCkpXG4gICAgICAgIGNvbnN0IHNldCA9IChvYmo6IENvbm5lY3RhYmxlLCAuLi5hcmdzOiBhbnlbXSkgPT4gdGhpcy5zZXQoZihvYmosIC4uLmFyZ3MpKVxuXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9ianMpKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG9iaiBvZiBvYmpzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW28sIHNdID0gb2JqXG4gICAgICAgICAgICAgICAgY29uc3QgaWQgPSBvLmNvbm5lY3Qocywgc2V0KVxuICAgICAgICAgICAgICAgIHRoaXMub25Ecm9wcGVkKCgpID0+IG8uZGlzY29ubmVjdChpZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNpZ09yRm4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IG9ianMuY29ubmVjdChzaWdPckZuLCBzZXQpXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRyb3BwZWQoKCkgPT4gb2Jqcy5kaXNjb25uZWN0KGlkKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzIGFzIHVua25vd24gYXMgVmFyaWFibGU8VD5cbiAgICB9XG5cbiAgICBzdGF0aWMgZGVyaXZlPFxuICAgICAgICBjb25zdCBEZXBzIGV4dGVuZHMgQXJyYXk8U3Vic2NyaWJhYmxlPGFueT4+LFxuICAgICAgICBBcmdzIGV4dGVuZHMge1xuICAgICAgICAgICAgW0sgaW4ga2V5b2YgRGVwc106IERlcHNbS10gZXh0ZW5kcyBTdWJzY3JpYmFibGU8aW5mZXIgVD4gPyBUIDogbmV2ZXJcbiAgICAgICAgfSxcbiAgICAgICAgViA9IEFyZ3MsXG4gICAgPihkZXBzOiBEZXBzLCBmbjogKC4uLmFyZ3M6IEFyZ3MpID0+IFYgPSAoLi4uYXJncykgPT4gYXJncyBhcyB1bmtub3duIGFzIFYpIHtcbiAgICAgICAgY29uc3QgdXBkYXRlID0gKCkgPT4gZm4oLi4uZGVwcy5tYXAoZCA9PiBkLmdldCgpKSBhcyBBcmdzKVxuICAgICAgICBjb25zdCBkZXJpdmVkID0gbmV3IFZhcmlhYmxlKHVwZGF0ZSgpKVxuICAgICAgICBjb25zdCB1bnN1YnMgPSBkZXBzLm1hcChkZXAgPT4gZGVwLnN1YnNjcmliZSgoKSA9PiBkZXJpdmVkLnNldCh1cGRhdGUoKSkpKVxuICAgICAgICBkZXJpdmVkLm9uRHJvcHBlZCgoKSA9PiB1bnN1YnMubWFwKHVuc3ViID0+IHVuc3ViKCkpKVxuICAgICAgICByZXR1cm4gZGVyaXZlZFxuICAgIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYXJpYWJsZTxUPiBleHRlbmRzIE9taXQ8VmFyaWFibGVXcmFwcGVyPFQ+LCBcImJpbmRcIj4ge1xuICAgIDxSPih0cmFuc2Zvcm06ICh2YWx1ZTogVCkgPT4gUik6IEJpbmRpbmc8Uj5cbiAgICAoKTogQmluZGluZzxUPlxufVxuXG5leHBvcnQgY29uc3QgVmFyaWFibGUgPSBuZXcgUHJveHkoVmFyaWFibGVXcmFwcGVyIGFzIGFueSwge1xuICAgIGFwcGx5OiAoX3QsIF9hLCBhcmdzKSA9PiBuZXcgVmFyaWFibGVXcmFwcGVyKGFyZ3NbMF0pLFxufSkgYXMge1xuICAgIGRlcml2ZTogdHlwZW9mIFZhcmlhYmxlV3JhcHBlcltcImRlcml2ZVwiXVxuICAgIDxUPihpbml0OiBUKTogVmFyaWFibGU8VD5cbiAgICBuZXc8VD4oaW5pdDogVCk6IFZhcmlhYmxlPFQ+XG59XG5cbmV4cG9ydCBjb25zdCB7IGRlcml2ZSB9ID0gVmFyaWFibGVcbmV4cG9ydCBkZWZhdWx0IFZhcmlhYmxlXG4iLCAiaW1wb3J0IEdPYmplY3QgZnJvbSBcImdpOi8vR09iamVjdFwiO1xuXG5leHBvcnQgY29uc3Qgc25ha2VpZnkgPSAoc3RyOiBzdHJpbmcpID0+IHN0clxuICAgIC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCBcIiQxXyQyXCIpXG4gICAgLnJlcGxhY2VBbGwoXCItXCIsIFwiX1wiKVxuICAgIC50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydCBjb25zdCBrZWJhYmlmeSA9IChzdHI6IHN0cmluZykgPT4gc3RyXG4gICAgLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csIFwiJDEtJDJcIilcbiAgICAucmVwbGFjZUFsbChcIl9cIiwgXCItXCIpXG4gICAgLnRvTG93ZXJDYXNlKClcblxuLyoqXG4gKiBBIHJlYWN0aXZlIHNvdXJjZSBvZiBhIHNpbmdsZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdWJzY3JpYmFibGU8VCA9IHVua25vd24+IHtcbiAgICAvKipcbiAgICAgKiBTdWJzY3JpYmUgdG8gdXBkYXRlcyBvbiB0aGUgdmFsdWUuXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIFRoZSBmdW5jdGlvbiB0byBjYWxsIHdoZW4gdGhlIHZhbHVlIGNoYW5nZXNcbiAgICAgKiBAcmV0dXJucyBBIGZ1bmN0aW9uIHRvIGNhbmNlbCB0aGUgc3Vic2NyaXB0aW9uXG4gICAgICovXG4gICAgc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFQpID0+IHZvaWQpOiAoKSA9PiB2b2lkXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBjdXJyZW50IHZhbHVlIChub24tcmVhY3RpdmVseSkuXG4gICAgICovXG4gICAgZ2V0KCk6IFRcbiAgICBba2V5OiBzdHJpbmddOiBhbnlcbn1cblxuLyoqXG4gKiBBIHJlYWN0aXZlIG9iamVjdCB3aXRoIG1hbnkgc2lnbmFscyB0aGF0IGNhbiBiZSBjb25uZWN0ZWQgdG8gaW5kaXZpZHVhbGx5LlxuICogVXN1YWxseSwgdGhlc2UgYXJlIGdvaW5nIHRvIGJlIEdPYmplY3RzLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbm5lY3RhYmxlIHtcbiAgICBjb25uZWN0KHNpZ25hbDogc3RyaW5nLCBjYWxsYmFjazogKC4uLmFyZ3M6IGFueVtdKSA9PiB1bmtub3duKTogbnVtYmVyXG4gICAgZGlzY29ubmVjdChpZDogbnVtYmVyKTogdm9pZFxuICAgIFtrZXk6IHN0cmluZ106IGFueVxufVxuXG5leHBvcnQgY2xhc3MgQmluZGluZzxWYWx1ZT4gaW1wbGVtZW50cyBTdWJzY3JpYmFibGU8VmFsdWU+IHtcbiAgICBwcml2YXRlIHRyYW5zZm9ybUZuID0gKHY6IGFueSkgPT4gdlxuXG4gICAgI2VtaXR0ZXI6IFN1YnNjcmliYWJsZTxWYWx1ZT4gfCBDb25uZWN0YWJsZVxuICAgICNwcm9wPzogc3RyaW5nXG5cbiAgICAvKipcbiAgICAgKiBCaW5kIHRvIGEgYENvbm5lY3RhYmxlYCdzIHByb3BlcnR5LCBwcmVzZXJ2aW5nIGl0cyByZWFjdGl2aXR5IHRvIGJlIHVzZWQgc29tZXdoZXJlIGVsc2UuXG4gICAgICovXG4gICAgc3RhdGljIGJpbmQ8XG4gICAgICAgIFQgZXh0ZW5kcyBDb25uZWN0YWJsZSxcbiAgICAgICAgUCBleHRlbmRzIGtleW9mIFQsXG4gICAgPihvYmplY3Q6IFQsIHByb3BlcnR5OiBQKTogQmluZGluZzxUW1BdPlxuXG4gICAgLyoqXG4gICAgICogQmluZCB0byBhIGBTdWJzY3JpYmFibGVgLCBwcmVzZXJ2aW5nIGl0cyByZWFjdGl2aXR5IHRvIGJlIHVzZWQgc29tZXdoZXJlIGVsc2UuXG4gICAgICovXG4gICAgc3RhdGljIGJpbmQ8VD4ob2JqZWN0OiBTdWJzY3JpYmFibGU8VD4pOiBCaW5kaW5nPFQ+XG5cbiAgICBzdGF0aWMgYmluZChlbWl0dGVyOiBDb25uZWN0YWJsZSB8IFN1YnNjcmliYWJsZSwgcHJvcD86IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbmV3IEJpbmRpbmcoZW1pdHRlciwgcHJvcClcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKGVtaXR0ZXI6IENvbm5lY3RhYmxlIHwgU3Vic2NyaWJhYmxlPFZhbHVlPiwgcHJvcD86IHN0cmluZykge1xuICAgICAgICB0aGlzLiNlbWl0dGVyID0gZW1pdHRlclxuICAgICAgICB0aGlzLiNwcm9wID0gcHJvcCAmJiBrZWJhYmlmeShwcm9wKVxuICAgIH1cblxuICAgIFtTeW1ib2wudG9QcmltaXRpdmVdKCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJCaW5kaW5nIGltcGxpY2l0bHkgY29udmVydGVkIHRvIGEgcHJpbWl0aXZlIHZhbHVlLiBUaGlzIGlzIGFsbW9zdCBhbHdheXMgYSBtaXN0YWtlLlwiKVxuICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyBtb3N0bHkgaGVyZSB0byBhaWQgaW4gZGVidWdnaW5nLlxuICAgICAqIEl0IHJldHVybnMgYSByZWd1bGFyLCBub24tcmVhY3RpdmUgc3RyaW5nLFxuICAgICAqIGFuZCB3aWxsIG5vdCB3b3JrIHRvIHJlYWN0aXZlbHkgdXNlIGEgYmluZGluZyBzb21ld2hlcmUgdGhhdCBleHBlY3RzIGEgcGxhaW4gc3RyaW5nLlxuICAgICAqL1xuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gYEJpbmRpbmc8JHt0aGlzLiNlbWl0dGVyfSR7dGhpcy4jcHJvcCA/IGAsIFwiJHt0aGlzLiNwcm9wfVwiYCA6IFwiXCJ9PmBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYmluZGluZyB0aGF0IGFkZGl0aW9uYWxseSBhcHBsaWVzIGEgZnVuY3Rpb24gb24gaXRzIHZhbHVlLlxuICAgICAqIEBwYXJhbSBmbiBUaGUgdHJhbnNmb3JtYXRpb24gdG8gYXBwbHkuIFRoaXMgc2hvdWxkIGJlIGEgcHVyZSBmdW5jdGlvbiwgYXMgaXQgY2FuIGJlIGNhbGxlZCBhdCBhbnkgdGltZS5cbiAgICAgKi9cbiAgICBhczxUPihmbjogKHY6IFZhbHVlKSA9PiBUKTogQmluZGluZzxUPiB7XG4gICAgICAgIGNvbnN0IGJpbmQgPSBuZXcgQmluZGluZyh0aGlzLiNlbWl0dGVyLCB0aGlzLiNwcm9wKVxuICAgICAgICBiaW5kLnRyYW5zZm9ybUZuID0gKHY6IFZhbHVlKSA9PiBmbih0aGlzLnRyYW5zZm9ybUZuKHYpKVxuICAgICAgICByZXR1cm4gYmluZCBhcyB1bmtub3duIGFzIEJpbmRpbmc8VD5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGJpbmRpbmcncyBjdXJyZW50IHZhbHVlIChub24tcmVhY3RpdmVseSkuXG4gICAgICovXG4gICAgZ2V0KCk6IFZhbHVlIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLiNlbWl0dGVyLmdldCA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtRm4odGhpcy4jZW1pdHRlci5nZXQoKSlcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuI3Byb3AgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGdldHRlciA9IGBnZXRfJHtzbmFrZWlmeSh0aGlzLiNwcm9wKX1gXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuI2VtaXR0ZXJbZ2V0dGVyXSA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybUZuKHRoaXMuI2VtaXR0ZXJbZ2V0dGVyXSgpKVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1Gbih0aGlzLiNlbWl0dGVyW3RoaXMuI3Byb3BdKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgRXJyb3IoXCJjYW4gbm90IGdldCB2YWx1ZSBvZiBiaW5kaW5nXCIpXG4gICAgfVxuXG4gICAgc3Vic2NyaWJlKGNhbGxiYWNrOiAodmFsdWU6IFZhbHVlKSA9PiB2b2lkKTogKCkgPT4gdm9pZCB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy4jZW1pdHRlci5zdWJzY3JpYmUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuI2VtaXR0ZXIuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLmdldCgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy4jZW1pdHRlci5jb25uZWN0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNpZ25hbCA9IGBub3RpZnk6OiR7dGhpcy4jcHJvcH1gXG4gICAgICAgICAgICBjb25zdCBpZCA9IHRoaXMuI2VtaXR0ZXIuY29ubmVjdChzaWduYWwsICgpID0+IHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayh0aGlzLmdldCgpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKEdPYmplY3Quc2lnbmFsX2hhbmRsZXJfaXNfY29ubmVjdGVkKHRoaXMuI2VtaXR0ZXIsIGlkKSlcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMuI2VtaXR0ZXIuZGlzY29ubmVjdCBhcyBDb25uZWN0YWJsZVtcImRpc2Nvbm5lY3RcIl0pKGlkKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRocm93IEVycm9yKGAke3RoaXMuI2VtaXR0ZXJ9IGlzIG5vdCBiaW5kYWJsZWApXG4gICAgfVxufVxuXG5leHBvcnQgY29uc3QgeyBiaW5kIH0gPSBCaW5kaW5nXG5leHBvcnQgZGVmYXVsdCBCaW5kaW5nXG4iLCAiaW1wb3J0IEFzdGFsIGZyb20gXCJnaTovL0FzdGFsSU9cIlxuXG5leHBvcnQgdHlwZSBUaW1lID0gQXN0YWwuVGltZVxuZXhwb3J0IGNvbnN0IFRpbWUgPSBBc3RhbC5UaW1lXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnRlcnZhbChpbnRlcnZhbDogbnVtYmVyLCBjYWxsYmFjaz86ICgpID0+IHZvaWQpIHtcbiAgICByZXR1cm4gQXN0YWwuVGltZS5pbnRlcnZhbChpbnRlcnZhbCwgKCkgPT4gdm9pZCBjYWxsYmFjaz8uKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lb3V0KHRpbWVvdXQ6IG51bWJlciwgY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIEFzdGFsLlRpbWUudGltZW91dCh0aW1lb3V0LCAoKSA9PiB2b2lkIGNhbGxiYWNrPy4oKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlkbGUoY2FsbGJhY2s/OiAoKSA9PiB2b2lkKSB7XG4gICAgcmV0dXJuIEFzdGFsLlRpbWUuaWRsZSgoKSA9PiB2b2lkIGNhbGxiYWNrPy4oKSlcbn1cbiIsICJpbXBvcnQgQXN0YWwgZnJvbSBcImdpOi8vQXN0YWxJT1wiXG5cbnR5cGUgQXJncyA9IHtcbiAgICBjbWQ6IHN0cmluZyB8IHN0cmluZ1tdXG4gICAgb3V0PzogKHN0ZG91dDogc3RyaW5nKSA9PiB2b2lkXG4gICAgZXJyPzogKHN0ZGVycjogc3RyaW5nKSA9PiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIFByb2Nlc3MgPSBBc3RhbC5Qcm9jZXNzXG5leHBvcnQgY29uc3QgUHJvY2VzcyA9IEFzdGFsLlByb2Nlc3NcblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnByb2Nlc3MoYXJnczogQXJncyk6IEFzdGFsLlByb2Nlc3NcblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnByb2Nlc3MoXG4gICAgY21kOiBzdHJpbmcgfCBzdHJpbmdbXSxcbiAgICBvbk91dD86IChzdGRvdXQ6IHN0cmluZykgPT4gdm9pZCxcbiAgICBvbkVycj86IChzdGRlcnI6IHN0cmluZykgPT4gdm9pZCxcbik6IEFzdGFsLlByb2Nlc3NcblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnByb2Nlc3MoXG4gICAgYXJnc09yQ21kOiBBcmdzIHwgc3RyaW5nIHwgc3RyaW5nW10sXG4gICAgb25PdXQ6IChzdGRvdXQ6IHN0cmluZykgPT4gdm9pZCA9IHByaW50LFxuICAgIG9uRXJyOiAoc3RkZXJyOiBzdHJpbmcpID0+IHZvaWQgPSBwcmludGVycixcbikge1xuICAgIGNvbnN0IGFyZ3MgPSBBcnJheS5pc0FycmF5KGFyZ3NPckNtZCkgfHwgdHlwZW9mIGFyZ3NPckNtZCA9PT0gXCJzdHJpbmdcIlxuICAgIGNvbnN0IHsgY21kLCBlcnIsIG91dCB9ID0ge1xuICAgICAgICBjbWQ6IGFyZ3MgPyBhcmdzT3JDbWQgOiBhcmdzT3JDbWQuY21kLFxuICAgICAgICBlcnI6IGFyZ3MgPyBvbkVyciA6IGFyZ3NPckNtZC5lcnIgfHwgb25FcnIsXG4gICAgICAgIG91dDogYXJncyA/IG9uT3V0IDogYXJnc09yQ21kLm91dCB8fCBvbk91dCxcbiAgICB9XG5cbiAgICBjb25zdCBwcm9jID0gQXJyYXkuaXNBcnJheShjbWQpXG4gICAgICAgID8gQXN0YWwuUHJvY2Vzcy5zdWJwcm9jZXNzdihjbWQpXG4gICAgICAgIDogQXN0YWwuUHJvY2Vzcy5zdWJwcm9jZXNzKGNtZClcblxuICAgIHByb2MuY29ubmVjdChcInN0ZG91dFwiLCAoXywgc3Rkb3V0OiBzdHJpbmcpID0+IG91dChzdGRvdXQpKVxuICAgIHByb2MuY29ubmVjdChcInN0ZGVyclwiLCAoXywgc3RkZXJyOiBzdHJpbmcpID0+IGVycihzdGRlcnIpKVxuICAgIHJldHVybiBwcm9jXG59XG5cbi8qKiBAdGhyb3dzIHtHTGliLkVycm9yfSBUaHJvd3Mgc3RkZXJyICovXG5leHBvcnQgZnVuY3Rpb24gZXhlYyhjbWQ6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoY21kKVxuICAgICAgICA/IEFzdGFsLlByb2Nlc3MuZXhlY3YoY21kKVxuICAgICAgICA6IEFzdGFsLlByb2Nlc3MuZXhlYyhjbWQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjQXN5bmMoY21kOiBzdHJpbmcgfCBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY21kKSkge1xuICAgICAgICAgICAgQXN0YWwuUHJvY2Vzcy5leGVjX2FzeW5jdihjbWQsIChfLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEFzdGFsLlByb2Nlc3MuZXhlY19hc3luY3ZfZmluaXNoKHJlcykpXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBBc3RhbC5Qcm9jZXNzLmV4ZWNfYXN5bmMoY21kLCAoXywgcmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShBc3RhbC5Qcm9jZXNzLmV4ZWNfZmluaXNoKHJlcykpXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxufVxuIiwgImltcG9ydCBWYXJpYWJsZSBmcm9tIFwiLi92YXJpYWJsZS5qc1wiXG5pbXBvcnQgeyBleGVjQXN5bmMgfSBmcm9tIFwiLi9wcm9jZXNzLmpzXCJcbmltcG9ydCBCaW5kaW5nLCB7IENvbm5lY3RhYmxlLCBrZWJhYmlmeSwgc25ha2VpZnksIFN1YnNjcmliYWJsZSB9IGZyb20gXCIuL2JpbmRpbmcuanNcIlxuXG5leHBvcnQgY29uc3Qgbm9JbXBsaWNpdERlc3Ryb3kgPSBTeW1ib2woXCJubyBubyBpbXBsaWNpdCBkZXN0cm95XCIpXG5leHBvcnQgY29uc3Qgc2V0Q2hpbGRyZW4gPSBTeW1ib2woXCJjaGlsZHJlbiBzZXR0ZXIgbWV0aG9kXCIpXG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZUJpbmRpbmdzKGFycmF5OiBhbnlbXSkge1xuICAgIGZ1bmN0aW9uIGdldFZhbHVlcyguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICBsZXQgaSA9IDBcbiAgICAgICAgcmV0dXJuIGFycmF5Lm1hcCh2YWx1ZSA9PiB2YWx1ZSBpbnN0YW5jZW9mIEJpbmRpbmdcbiAgICAgICAgICAgID8gYXJnc1tpKytdXG4gICAgICAgICAgICA6IHZhbHVlLFxuICAgICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgYmluZGluZ3MgPSBhcnJheS5maWx0ZXIoaSA9PiBpIGluc3RhbmNlb2YgQmluZGluZylcblxuICAgIGlmIChiaW5kaW5ncy5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybiBhcnJheVxuXG4gICAgaWYgKGJpbmRpbmdzLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgcmV0dXJuIGJpbmRpbmdzWzBdLmFzKGdldFZhbHVlcylcblxuICAgIHJldHVybiBWYXJpYWJsZS5kZXJpdmUoYmluZGluZ3MsIGdldFZhbHVlcykoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UHJvcChvYmo6IGFueSwgcHJvcDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3Qgc2V0dGVyID0gYHNldF8ke3NuYWtlaWZ5KHByb3ApfWBcbiAgICAgICAgaWYgKHR5cGVvZiBvYmpbc2V0dGVyXSA9PT0gXCJmdW5jdGlvblwiKVxuICAgICAgICAgICAgcmV0dXJuIG9ialtzZXR0ZXJdKHZhbHVlKVxuXG4gICAgICAgIHJldHVybiAob2JqW3Byb3BdID0gdmFsdWUpXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgY291bGQgbm90IHNldCBwcm9wZXJ0eSBcIiR7cHJvcH1cIiBvbiAke29ian06YCwgZXJyb3IpXG4gICAgfVxufVxuXG5leHBvcnQgdHlwZSBCaW5kYWJsZVByb3BzPFQ+ID0ge1xuICAgIFtLIGluIGtleW9mIFRdOiBCaW5kaW5nPFRbS10+IHwgVFtLXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhvb2s8V2lkZ2V0IGV4dGVuZHMgQ29ubmVjdGFibGU+KFxuICAgIHdpZGdldDogV2lkZ2V0LFxuICAgIG9iamVjdDogQ29ubmVjdGFibGUgfCBTdWJzY3JpYmFibGUsXG4gICAgc2lnbmFsT3JDYWxsYmFjazogc3RyaW5nIHwgKChzZWxmOiBXaWRnZXQsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKSxcbiAgICBjYWxsYmFjaz86IChzZWxmOiBXaWRnZXQsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLFxuKSB7XG4gICAgaWYgKHR5cGVvZiBvYmplY3QuY29ubmVjdCA9PT0gXCJmdW5jdGlvblwiICYmIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGlkID0gb2JqZWN0LmNvbm5lY3Qoc2lnbmFsT3JDYWxsYmFjaywgKF86IGFueSwgLi4uYXJnczogdW5rbm93bltdKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sod2lkZ2V0LCAuLi5hcmdzKVxuICAgICAgICB9KVxuICAgICAgICB3aWRnZXQuY29ubmVjdChcImRlc3Ryb3lcIiwgKCkgPT4ge1xuICAgICAgICAgICAgKG9iamVjdC5kaXNjb25uZWN0IGFzIENvbm5lY3RhYmxlW1wiZGlzY29ubmVjdFwiXSkoaWQpXG4gICAgICAgIH0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqZWN0LnN1YnNjcmliZSA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBzaWduYWxPckNhbGxiYWNrID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29uc3QgdW5zdWIgPSBvYmplY3Quc3Vic2NyaWJlKCguLi5hcmdzOiB1bmtub3duW10pID0+IHtcbiAgICAgICAgICAgIHNpZ25hbE9yQ2FsbGJhY2sod2lkZ2V0LCAuLi5hcmdzKVxuICAgICAgICB9KVxuICAgICAgICB3aWRnZXQuY29ubmVjdChcImRlc3Ryb3lcIiwgdW5zdWIpXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3RydWN0PFdpZGdldCBleHRlbmRzIENvbm5lY3RhYmxlICYgeyBbc2V0Q2hpbGRyZW5dOiAoY2hpbGRyZW46IGFueVtdKSA9PiB2b2lkIH0+KHdpZGdldDogV2lkZ2V0LCBjb25maWc6IGFueSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3RcbiAgICBsZXQgeyBzZXR1cCwgY2hpbGQsIGNoaWxkcmVuID0gW10sIC4uLnByb3BzIH0gPSBjb25maWdcblxuICAgIGlmIChjaGlsZHJlbiBpbnN0YW5jZW9mIEJpbmRpbmcpIHtcbiAgICAgICAgY2hpbGRyZW4gPSBbY2hpbGRyZW5dXG4gICAgfVxuXG4gICAgaWYgKGNoaWxkKSB7XG4gICAgICAgIGNoaWxkcmVuLnVuc2hpZnQoY2hpbGQpXG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIHVuZGVmaW5lZCB2YWx1ZXNcbiAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhwcm9wcykpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1trZXldXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjb2xsZWN0IGJpbmRpbmdzXG4gICAgY29uc3QgYmluZGluZ3M6IEFycmF5PFtzdHJpbmcsIEJpbmRpbmc8YW55Pl0+ID0gT2JqZWN0XG4gICAgICAgIC5rZXlzKHByb3BzKVxuICAgICAgICAucmVkdWNlKChhY2M6IGFueSwgcHJvcCkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb3BzW3Byb3BdIGluc3RhbmNlb2YgQmluZGluZykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGJpbmRpbmcgPSBwcm9wc1twcm9wXVxuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1twcm9wXVxuICAgICAgICAgICAgICAgIHJldHVybiBbLi4uYWNjLCBbcHJvcCwgYmluZGluZ11dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgIH0sIFtdKVxuXG4gICAgLy8gY29sbGVjdCBzaWduYWwgaGFuZGxlcnNcbiAgICBjb25zdCBvbkhhbmRsZXJzOiBBcnJheTxbc3RyaW5nLCBzdHJpbmcgfCAoKCkgPT4gdW5rbm93bildPiA9IE9iamVjdFxuICAgICAgICAua2V5cyhwcm9wcylcbiAgICAgICAgLnJlZHVjZSgoYWNjOiBhbnksIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKFwib25cIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzaWcgPSBrZWJhYmlmeShrZXkpLnNwbGl0KFwiLVwiKS5zbGljZSgxKS5qb2luKFwiLVwiKVxuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBwcm9wc1trZXldXG4gICAgICAgICAgICAgICAgZGVsZXRlIHByb3BzW2tleV1cbiAgICAgICAgICAgICAgICByZXR1cm4gWy4uLmFjYywgW3NpZywgaGFuZGxlcl1dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgIH0sIFtdKVxuXG4gICAgLy8gc2V0IGNoaWxkcmVuXG4gICAgY29uc3QgbWVyZ2VkQ2hpbGRyZW4gPSBtZXJnZUJpbmRpbmdzKGNoaWxkcmVuLmZsYXQoSW5maW5pdHkpKVxuICAgIGlmIChtZXJnZWRDaGlsZHJlbiBpbnN0YW5jZW9mIEJpbmRpbmcpIHtcbiAgICAgICAgd2lkZ2V0W3NldENoaWxkcmVuXShtZXJnZWRDaGlsZHJlbi5nZXQoKSlcbiAgICAgICAgd2lkZ2V0LmNvbm5lY3QoXCJkZXN0cm95XCIsIG1lcmdlZENoaWxkcmVuLnN1YnNjcmliZSgodikgPT4ge1xuICAgICAgICAgICAgd2lkZ2V0W3NldENoaWxkcmVuXSh2KVxuICAgICAgICB9KSlcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobWVyZ2VkQ2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgd2lkZ2V0W3NldENoaWxkcmVuXShtZXJnZWRDaGlsZHJlbilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNldHVwIHNpZ25hbCBoYW5kbGVyc1xuICAgIGZvciAoY29uc3QgW3NpZ25hbCwgY2FsbGJhY2tdIG9mIG9uSGFuZGxlcnMpIHtcbiAgICAgICAgY29uc3Qgc2lnID0gc2lnbmFsLnN0YXJ0c1dpdGgoXCJub3RpZnlcIilcbiAgICAgICAgICAgID8gc2lnbmFsLnJlcGxhY2UoXCItXCIsIFwiOjpcIilcbiAgICAgICAgICAgIDogc2lnbmFsXG5cbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB3aWRnZXQuY29ubmVjdChzaWcsIGNhbGxiYWNrKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2lkZ2V0LmNvbm5lY3Qoc2lnLCAoKSA9PiBleGVjQXN5bmMoY2FsbGJhY2spXG4gICAgICAgICAgICAgICAgLnRoZW4ocHJpbnQpLmNhdGNoKGNvbnNvbGUuZXJyb3IpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2V0dXAgYmluZGluZ3MgaGFuZGxlcnNcbiAgICBmb3IgKGNvbnN0IFtwcm9wLCBiaW5kaW5nXSBvZiBiaW5kaW5ncykge1xuICAgICAgICBpZiAocHJvcCA9PT0gXCJjaGlsZFwiIHx8IHByb3AgPT09IFwiY2hpbGRyZW5cIikge1xuICAgICAgICAgICAgd2lkZ2V0LmNvbm5lY3QoXCJkZXN0cm95XCIsIGJpbmRpbmcuc3Vic2NyaWJlKCh2OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICB3aWRnZXRbc2V0Q2hpbGRyZW5dKHYpXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgfVxuICAgICAgICB3aWRnZXQuY29ubmVjdChcImRlc3Ryb3lcIiwgYmluZGluZy5zdWJzY3JpYmUoKHY6IGFueSkgPT4ge1xuICAgICAgICAgICAgc2V0UHJvcCh3aWRnZXQsIHByb3AsIHYpXG4gICAgICAgIH0pKVxuICAgICAgICBzZXRQcm9wKHdpZGdldCwgcHJvcCwgYmluZGluZy5nZXQoKSlcbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgdW5kZWZpbmVkIHZhbHVlc1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHByb3BzKSkge1xuICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZGVsZXRlIHByb3BzW2tleV1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24od2lkZ2V0LCBwcm9wcylcbiAgICBzZXR1cD8uKHdpZGdldClcbiAgICByZXR1cm4gd2lkZ2V0XG59XG5cbmZ1bmN0aW9uIGlzQXJyb3dGdW5jdGlvbihmdW5jOiBhbnkpOiBmdW5jIGlzIChhcmdzOiBhbnkpID0+IGFueSB7XG4gICAgcmV0dXJuICFPYmplY3QuaGFzT3duKGZ1bmMsIFwicHJvdG90eXBlXCIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBqc3goXG4gICAgY3RvcnM6IFJlY29yZDxzdHJpbmcsIHsgbmV3KHByb3BzOiBhbnkpOiBhbnkgfSB8ICgocHJvcHM6IGFueSkgPT4gYW55KT4sXG4gICAgY3Rvcjogc3RyaW5nIHwgKChwcm9wczogYW55KSA9PiBhbnkpIHwgeyBuZXcocHJvcHM6IGFueSk6IGFueSB9LFxuICAgIHsgY2hpbGRyZW4sIC4uLnByb3BzIH06IGFueSxcbikge1xuICAgIGNoaWxkcmVuID8/PSBbXVxuXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNoaWxkcmVuKSlcbiAgICAgICAgY2hpbGRyZW4gPSBbY2hpbGRyZW5dXG5cbiAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihCb29sZWFuKVxuXG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA9PT0gMSlcbiAgICAgICAgcHJvcHMuY2hpbGQgPSBjaGlsZHJlblswXVxuICAgIGVsc2UgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpXG4gICAgICAgIHByb3BzLmNoaWxkcmVuID0gY2hpbGRyZW5cblxuICAgIGlmICh0eXBlb2YgY3RvciA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAoaXNBcnJvd0Z1bmN0aW9uKGN0b3JzW2N0b3JdKSlcbiAgICAgICAgICAgIHJldHVybiBjdG9yc1tjdG9yXShwcm9wcylcblxuICAgICAgICByZXR1cm4gbmV3IGN0b3JzW2N0b3JdKHByb3BzKVxuICAgIH1cblxuICAgIGlmIChpc0Fycm93RnVuY3Rpb24oY3RvcikpXG4gICAgICAgIHJldHVybiBjdG9yKHByb3BzKVxuXG4gICAgcmV0dXJuIG5ldyBjdG9yKHByb3BzKVxufVxuIiwgImltcG9ydCB7IG5vSW1wbGljaXREZXN0cm95LCBzZXRDaGlsZHJlbiwgdHlwZSBCaW5kYWJsZVByb3BzLCBjb25zdHJ1Y3QgfSBmcm9tIFwiLi4vX2FzdGFsLmpzXCJcbmltcG9ydCBHdGsgZnJvbSBcImdpOi8vR3RrP3ZlcnNpb249NC4wXCJcbmltcG9ydCBHZGsgZnJvbSBcImdpOi8vR2RrP3ZlcnNpb249NC4wXCJcbmltcG9ydCBCaW5kaW5nIGZyb20gXCIuLi9iaW5kaW5nLmpzXCJcblxuZXhwb3J0IGNvbnN0IHR5cGUgPSBTeW1ib2woXCJjaGlsZCB0eXBlXCIpXG5jb25zdCBkdW1teUJ1bGRlciA9IG5ldyBHdGsuQnVpbGRlclxuXG5mdW5jdGlvbiBfZ2V0Q2hpbGRyZW4od2lkZ2V0OiBHdGsuV2lkZ2V0KTogQXJyYXk8R3RrLldpZGdldD4ge1xuICAgIGlmIChcImdldF9jaGlsZFwiIGluIHdpZGdldCAmJiB0eXBlb2Ygd2lkZ2V0LmdldF9jaGlsZCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIHdpZGdldC5nZXRfY2hpbGQoKSA/IFt3aWRnZXQuZ2V0X2NoaWxkKCldIDogW11cbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8R3RrLldpZGdldD4gPSBbXVxuICAgIGxldCBjaCA9IHdpZGdldC5nZXRfZmlyc3RfY2hpbGQoKVxuICAgIHdoaWxlIChjaCAhPT0gbnVsbCkge1xuICAgICAgICBjaGlsZHJlbi5wdXNoKGNoKVxuICAgICAgICBjaCA9IGNoLmdldF9uZXh0X3NpYmxpbmcoKVxuICAgIH1cbiAgICByZXR1cm4gY2hpbGRyZW5cbn1cblxuZnVuY3Rpb24gX3NldENoaWxkcmVuKHdpZGdldDogR3RrLldpZGdldCwgY2hpbGRyZW46IGFueVtdKSB7XG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5mbGF0KEluZmluaXR5KS5tYXAoY2ggPT4gY2ggaW5zdGFuY2VvZiBHdGsuV2lkZ2V0XG4gICAgICAgID8gY2hcbiAgICAgICAgOiBuZXcgR3RrLkxhYmVsKHsgdmlzaWJsZTogdHJ1ZSwgbGFiZWw6IFN0cmluZyhjaCkgfSkpXG5cblxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgd2lkZ2V0LnZmdW5jX2FkZF9jaGlsZChcbiAgICAgICAgICAgIGR1bW15QnVsZGVyLFxuICAgICAgICAgICAgY2hpbGQsXG4gICAgICAgICAgICB0eXBlIGluIGNoaWxkID8gY2hpbGRbdHlwZV0gOiBudWxsLFxuICAgICAgICApXG4gICAgfVxufVxuXG50eXBlIENvbmZpZzxUIGV4dGVuZHMgR3RrLldpZGdldD4gPSB7XG4gICAgc2V0Q2hpbGRyZW4od2lkZ2V0OiBULCBjaGlsZHJlbjogYW55W10pOiB2b2lkXG4gICAgZ2V0Q2hpbGRyZW4od2lkZ2V0OiBUKTogQXJyYXk8R3RrLldpZGdldD5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXN0YWxpZnk8XG4gICAgV2lkZ2V0IGV4dGVuZHMgR3RrLldpZGdldCxcbiAgICBQcm9wcyBleHRlbmRzIEd0ay5XaWRnZXQuQ29uc3RydWN0b3JQcm9wcyA9IEd0ay5XaWRnZXQuQ29uc3RydWN0b3JQcm9wcyxcbiAgICBTaWduYWxzIGV4dGVuZHMgUmVjb3JkPGBvbiR7c3RyaW5nfWAsIEFycmF5PHVua25vd24+PiA9IFJlY29yZDxgb24ke3N0cmluZ31gLCBhbnlbXT4sXG4+KGNsczogeyBuZXcoLi4uYXJnczogYW55W10pOiBXaWRnZXQgfSwgY29uZmlnOiBQYXJ0aWFsPENvbmZpZzxXaWRnZXQ+PiA9IHt9KSB7XG4gICAgT2JqZWN0LmFzc2lnbihjbHMucHJvdG90eXBlLCB7XG4gICAgICAgIFtzZXRDaGlsZHJlbl0oY2hpbGRyZW46IGFueVtdKSB7XG4gICAgICAgICAgICBjb25zdCB3ID0gdGhpcyBhcyB1bmtub3duIGFzIFdpZGdldFxuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiAoY29uZmlnLmdldENoaWxkcmVuPy4odykgfHwgX2dldENoaWxkcmVuKHcpKSkge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZCBpbnN0YW5jZW9mIEd0ay5XaWRnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hpbGQudW5wYXJlbnQoKVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNoaWxkcmVuLmluY2x1ZGVzKGNoaWxkKSAmJiBub0ltcGxpY2l0RGVzdHJveSBpbiB0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGQucnVuX2Rpc3Bvc2UoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5zZXRDaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGNvbmZpZy5zZXRDaGlsZHJlbih3LCBjaGlsZHJlbilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX3NldENoaWxkcmVuKHcsIGNoaWxkcmVuKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pXG5cbiAgICByZXR1cm4ge1xuICAgICAgICBbY2xzLm5hbWVdOiAoXG4gICAgICAgICAgICBwcm9wczogQ29uc3RydWN0UHJvcHM8V2lkZ2V0LCBQcm9wcywgU2lnbmFscz4gPSB7fSxcbiAgICAgICAgICAgIC4uLmNoaWxkcmVuOiBhbnlbXVxuICAgICAgICApOiBXaWRnZXQgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gbmV3IGNscyhcImNzc05hbWVcIiBpbiBwcm9wcyA/IHsgY3NzTmFtZTogcHJvcHMuY3NzTmFtZSB9IDoge30pXG5cbiAgICAgICAgICAgIGlmIChcImNzc05hbWVcIiBpbiBwcm9wcykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wcy5jc3NOYW1lXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwcm9wcy5ub0ltcGxpY2l0RGVzdHJveSkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24od2lkZ2V0LCB7IFtub0ltcGxpY2l0RGVzdHJveV06IHRydWUgfSlcbiAgICAgICAgICAgICAgICBkZWxldGUgcHJvcHMubm9JbXBsaWNpdERlc3Ryb3lcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHByb3BzLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuYXNzaWduKHdpZGdldCwgeyBbdHlwZV06IHByb3BzLnR5cGUgfSlcbiAgICAgICAgICAgICAgICBkZWxldGUgcHJvcHMudHlwZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIE9iamVjdC5hc3NpZ24ocHJvcHMsIHsgY2hpbGRyZW4gfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdCh3aWRnZXQgYXMgYW55LCBzZXR1cENvbnRyb2xsZXJzKHdpZGdldCwgcHJvcHMgYXMgYW55KSlcbiAgICAgICAgfSxcbiAgICB9W2Nscy5uYW1lXVxufVxuXG50eXBlIFNpZ0hhbmRsZXI8XG4gICAgVyBleHRlbmRzIEluc3RhbmNlVHlwZTx0eXBlb2YgR3RrLldpZGdldD4sXG4gICAgQXJncyBleHRlbmRzIEFycmF5PHVua25vd24+LFxuPiA9ICgoc2VsZjogVywgLi4uYXJnczogQXJncykgPT4gdW5rbm93bikgfCBzdHJpbmcgfCBzdHJpbmdbXVxuXG5leHBvcnQgeyBCaW5kYWJsZVByb3BzIH1cbmV4cG9ydCB0eXBlIEJpbmRhYmxlQ2hpbGQgPSBHdGsuV2lkZ2V0IHwgQmluZGluZzxHdGsuV2lkZ2V0PlxuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RQcm9wczxcbiAgICBTZWxmIGV4dGVuZHMgSW5zdGFuY2VUeXBlPHR5cGVvZiBHdGsuV2lkZ2V0PixcbiAgICBQcm9wcyBleHRlbmRzIEd0ay5XaWRnZXQuQ29uc3RydWN0b3JQcm9wcyxcbiAgICBTaWduYWxzIGV4dGVuZHMgUmVjb3JkPGBvbiR7c3RyaW5nfWAsIEFycmF5PHVua25vd24+PiA9IFJlY29yZDxgb24ke3N0cmluZ31gLCBhbnlbXT4sXG4+ID0gUGFydGlhbDx7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjYW4ndCBhc3NpZ24gdG8gdW5rbm93biwgYnV0IGl0IHdvcmtzIGFzIGV4cGVjdGVkIHRob3VnaFxuICAgIFtTIGluIGtleW9mIFNpZ25hbHNdOiBTaWdIYW5kbGVyPFNlbGYsIFNpZ25hbHNbU10+XG59PiAmIFBhcnRpYWw8e1xuICAgIFtLZXkgaW4gYG9uJHtzdHJpbmd9YF06IFNpZ0hhbmRsZXI8U2VsZiwgYW55W10+XG59PiAmIFBhcnRpYWw8QmluZGFibGVQcm9wczxPbWl0PFByb3BzLCBcImNzc05hbWVcIiB8IFwiY3NzX25hbWVcIj4+PiAmIHtcbiAgICBub0ltcGxpY2l0RGVzdHJveT86IHRydWVcbiAgICB0eXBlPzogc3RyaW5nXG4gICAgY3NzTmFtZT86IHN0cmluZ1xufSAmIEV2ZW50Q29udHJvbGxlcjxTZWxmPiAmIHtcbiAgICBvbkRlc3Ryb3k/OiAoc2VsZjogU2VsZikgPT4gdW5rbm93blxuICAgIHNldHVwPzogKHNlbGY6IFNlbGYpID0+IHZvaWRcbn1cblxudHlwZSBFdmVudENvbnRyb2xsZXI8U2VsZiBleHRlbmRzIEd0ay5XaWRnZXQ+ID0ge1xuICAgIG9uRm9jdXNFbnRlcj86IChzZWxmOiBTZWxmKSA9PiB2b2lkXG4gICAgb25Gb2N1c0xlYXZlPzogKHNlbGY6IFNlbGYpID0+IHZvaWRcblxuICAgIG9uS2V5UHJlc3NlZD86IChzZWxmOiBTZWxmLCBrZXl2YWw6IG51bWJlciwga2V5Y29kZTogbnVtYmVyLCBzdGF0ZTogR2RrLk1vZGlmaWVyVHlwZSkgPT4gdm9pZFxuICAgIG9uS2V5UmVsZWFzZWQ/OiAoc2VsZjogU2VsZiwga2V5dmFsOiBudW1iZXIsIGtleWNvZGU6IG51bWJlciwgc3RhdGU6IEdkay5Nb2RpZmllclR5cGUpID0+IHZvaWRcbiAgICBvbktleU1vZGlmaWVyPzogKHNlbGY6IFNlbGYsIHN0YXRlOiBHZGsuTW9kaWZpZXJUeXBlKSA9PiB2b2lkXG5cbiAgICBvbkxlZ2FjeT86IChzZWxmOiBTZWxmLCBldmVudDogR2RrLkV2ZW50KSA9PiB2b2lkXG4gICAgb25CdXR0b25QcmVzc2VkPzogKHNlbGY6IFNlbGYsIHN0YXRlOiBHZGsuQnV0dG9uRXZlbnQpID0+IHZvaWRcbiAgICBvbkJ1dHRvblJlbGVhc2VkPzogKHNlbGY6IFNlbGYsIHN0YXRlOiBHZGsuQnV0dG9uRXZlbnQpID0+IHZvaWRcblxuICAgIG9uSG92ZXJFbnRlcj86IChzZWxmOiBTZWxmLCB4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gdm9pZFxuICAgIG9uSG92ZXJMZWF2ZT86IChzZWxmOiBTZWxmKSA9PiB2b2lkXG4gICAgb25Nb3Rpb24/OiAoc2VsZjogU2VsZiwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHZvaWRcblxuICAgIG9uU2Nyb2xsPzogKHNlbGY6IFNlbGYsIGR4OiBudW1iZXIsIGR5OiBudW1iZXIpID0+IHZvaWRcbiAgICBvblNjcm9sbERlY2VsZXJhdGU/OiAoc2VsZjogU2VsZiwgdmVsX3g6IG51bWJlciwgdmVsX3k6IG51bWJlcikgPT4gdm9pZFxufVxuXG5mdW5jdGlvbiBzZXR1cENvbnRyb2xsZXJzPFQ+KHdpZGdldDogR3RrLldpZGdldCwge1xuICAgIG9uRm9jdXNFbnRlcixcbiAgICBvbkZvY3VzTGVhdmUsXG4gICAgb25LZXlQcmVzc2VkLFxuICAgIG9uS2V5UmVsZWFzZWQsXG4gICAgb25LZXlNb2RpZmllcixcbiAgICBvbkxlZ2FjeSxcbiAgICBvbkJ1dHRvblByZXNzZWQsXG4gICAgb25CdXR0b25SZWxlYXNlZCxcbiAgICBvbkhvdmVyRW50ZXIsXG4gICAgb25Ib3ZlckxlYXZlLFxuICAgIG9uTW90aW9uLFxuICAgIG9uU2Nyb2xsLFxuICAgIG9uU2Nyb2xsRGVjZWxlcmF0ZSxcbiAgICAuLi5wcm9wc1xufTogRXZlbnRDb250cm9sbGVyPEd0ay5XaWRnZXQ+ICYgVCkge1xuICAgIGlmIChvbkZvY3VzRW50ZXIgfHwgb25Gb2N1c0xlYXZlKSB7XG4gICAgICAgIGNvbnN0IGZvY3VzID0gbmV3IEd0ay5FdmVudENvbnRyb2xsZXJGb2N1c1xuICAgICAgICB3aWRnZXQuYWRkX2NvbnRyb2xsZXIoZm9jdXMpXG5cbiAgICAgICAgaWYgKG9uRm9jdXNFbnRlcilcbiAgICAgICAgICAgIGZvY3VzLmNvbm5lY3QoXCJlbnRlclwiLCAoKSA9PiBvbkZvY3VzRW50ZXIod2lkZ2V0KSlcblxuICAgICAgICBpZiAob25Gb2N1c0xlYXZlKVxuICAgICAgICAgICAgZm9jdXMuY29ubmVjdChcImxlYXZlXCIsICgpID0+IG9uRm9jdXNMZWF2ZSh3aWRnZXQpKVxuICAgIH1cblxuICAgIGlmIChvbktleVByZXNzZWQgfHwgb25LZXlSZWxlYXNlZCB8fCBvbktleU1vZGlmaWVyKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IG5ldyBHdGsuRXZlbnRDb250cm9sbGVyS2V5XG4gICAgICAgIHdpZGdldC5hZGRfY29udHJvbGxlcihrZXkpXG5cbiAgICAgICAgaWYgKG9uS2V5UHJlc3NlZClcbiAgICAgICAgICAgIGtleS5jb25uZWN0KFwia2V5LXByZXNzZWRcIiwgKF8sIHZhbCwgY29kZSwgc3RhdGUpID0+IG9uS2V5UHJlc3NlZCh3aWRnZXQsIHZhbCwgY29kZSwgc3RhdGUpKVxuXG4gICAgICAgIGlmIChvbktleVJlbGVhc2VkKVxuICAgICAgICAgICAga2V5LmNvbm5lY3QoXCJrZXktcmVsZWFzZWRcIiwgKF8sIHZhbCwgY29kZSwgc3RhdGUpID0+IG9uS2V5UmVsZWFzZWQod2lkZ2V0LCB2YWwsIGNvZGUsIHN0YXRlKSlcblxuICAgICAgICBpZiAob25LZXlNb2RpZmllcilcbiAgICAgICAgICAgIGtleS5jb25uZWN0KFwibW9kaWZpZXJzXCIsIChfLCBzdGF0ZSkgPT4gb25LZXlNb2RpZmllcih3aWRnZXQsIHN0YXRlKSlcbiAgICB9XG5cbiAgICBpZiAob25MZWdhY3kgfHwgb25CdXR0b25QcmVzc2VkIHx8IG9uQnV0dG9uUmVsZWFzZWQpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gbmV3IEd0ay5FdmVudENvbnRyb2xsZXJMZWdhY3lcbiAgICAgICAgd2lkZ2V0LmFkZF9jb250cm9sbGVyKGxlZ2FjeSlcblxuICAgICAgICBsZWdhY3kuY29ubmVjdChcImV2ZW50XCIsIChfLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldF9ldmVudF90eXBlKCkgPT09IEdkay5FdmVudFR5cGUuQlVUVE9OX1BSRVNTKSB7XG4gICAgICAgICAgICAgICAgb25CdXR0b25QcmVzc2VkPy4od2lkZ2V0LCBldmVudCBhcyBHZGsuQnV0dG9uRXZlbnQpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChldmVudC5nZXRfZXZlbnRfdHlwZSgpID09PSBHZGsuRXZlbnRUeXBlLkJVVFRPTl9SRUxFQVNFKSB7XG4gICAgICAgICAgICAgICAgb25CdXR0b25SZWxlYXNlZD8uKHdpZGdldCwgZXZlbnQgYXMgR2RrLkJ1dHRvbkV2ZW50KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBvbkxlZ2FjeT8uKHdpZGdldCwgZXZlbnQpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKG9uTW90aW9uIHx8IG9uSG92ZXJFbnRlciB8fCBvbkhvdmVyTGVhdmUpIHtcbiAgICAgICAgY29uc3QgaG92ZXIgPSBuZXcgR3RrLkV2ZW50Q29udHJvbGxlck1vdGlvblxuICAgICAgICB3aWRnZXQuYWRkX2NvbnRyb2xsZXIoaG92ZXIpXG5cbiAgICAgICAgaWYgKG9uSG92ZXJFbnRlcilcbiAgICAgICAgICAgIGhvdmVyLmNvbm5lY3QoXCJlbnRlclwiLCAoXywgeCwgeSkgPT4gb25Ib3ZlckVudGVyKHdpZGdldCwgeCwgeSkpXG5cbiAgICAgICAgaWYgKG9uSG92ZXJMZWF2ZSlcbiAgICAgICAgICAgIGhvdmVyLmNvbm5lY3QoXCJsZWF2ZVwiLCAoKSA9PiBvbkhvdmVyTGVhdmUod2lkZ2V0KSlcblxuICAgICAgICBpZiAob25Nb3Rpb24pXG4gICAgICAgICAgICBob3Zlci5jb25uZWN0KFwibW90aW9uXCIsIChfLCB4LCB5KSA9PiBvbk1vdGlvbih3aWRnZXQsIHgsIHkpKVxuICAgIH1cblxuICAgIGlmIChvblNjcm9sbCB8fCBvblNjcm9sbERlY2VsZXJhdGUpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsID0gbmV3IEd0ay5FdmVudENvbnRyb2xsZXJTY3JvbGxcbiAgICAgICAgc2Nyb2xsLmZsYWdzID0gR3RrLkV2ZW50Q29udHJvbGxlclNjcm9sbEZsYWdzLkJPVEhfQVhFUyB8IEd0ay5FdmVudENvbnRyb2xsZXJTY3JvbGxGbGFncy5LSU5FVElDXG4gICAgICAgIHdpZGdldC5hZGRfY29udHJvbGxlcihzY3JvbGwpXG5cbiAgICAgICAgaWYgKG9uU2Nyb2xsKVxuICAgICAgICAgICAgc2Nyb2xsLmNvbm5lY3QoXCJzY3JvbGxcIiwgKF8sIHgsIHkpID0+IG9uU2Nyb2xsKHdpZGdldCwgeCwgeSkpXG5cbiAgICAgICAgaWYgKG9uU2Nyb2xsRGVjZWxlcmF0ZSlcbiAgICAgICAgICAgIHNjcm9sbC5jb25uZWN0KFwiZGVjZWxlcmF0ZVwiLCAoXywgeCwgeSkgPT4gb25TY3JvbGxEZWNlbGVyYXRlKHdpZGdldCwgeCwgeSkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3BzXG59XG4iLCAiaW1wb3J0IEdMaWIgZnJvbSBcImdpOi8vR0xpYj92ZXJzaW9uPTIuMFwiXG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgQXN0YWwgZnJvbSBcImdpOi8vQXN0YWw/dmVyc2lvbj00LjBcIlxuaW1wb3J0IHsgbWtBcHAgfSBmcm9tIFwiLi4vX2FwcFwiXG5cbkd0ay5pbml0KClcblxuLy8gc3RvcCB0aGlzIGZyb20gbGVha2luZyBpbnRvIHN1YnByb2Nlc3Nlc1xuLy8gYW5kIGdpbyBsYXVuY2ggaW52b2NhdGlvbnNcbkdMaWIudW5zZXRlbnYoXCJMRF9QUkVMT0FEXCIpXG5cbi8vIHVzZXJzIG1pZ2h0IHdhbnQgdG8gdXNlIEFkd2FpdGEgaW4gd2hpY2ggY2FzZSBpdCBoYXMgdG8gYmUgaW5pdGlhbGl6ZWRcbi8vIGl0IG1pZ2h0IGJlIGNvbW1vbiBwaXRmYWxsIHRvIGZvcmdldCBpdCBiZWNhdXNlIGBBcHBgIGlzIG5vdCBgQWR3LkFwcGxpY2F0aW9uYFxuYXdhaXQgaW1wb3J0KFwiZ2k6Ly9BZHc/dmVyc2lvbj0xXCIpXG4gICAgLnRoZW4oKHsgZGVmYXVsdDogQWR3IH0pID0+IEFkdy5pbml0KCkpXG4gICAgLmNhdGNoKCgpID0+IHZvaWQgMClcblxuZXhwb3J0IGRlZmF1bHQgbWtBcHAoQXN0YWwuQXBwbGljYXRpb24pXG4iLCAiLyoqXG4gKiBXb3JrYXJvdW5kIGZvciBcIkNhbid0IGNvbnZlcnQgbm9uLW51bGwgcG9pbnRlciB0byBKUyB2YWx1ZSBcIlxuICovXG5cbmV4cG9ydCB7IH1cblxuY29uc3Qgc25ha2VpZnkgPSAoc3RyOiBzdHJpbmcpID0+IHN0clxuICAgIC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCBcIiQxXyQyXCIpXG4gICAgLnJlcGxhY2VBbGwoXCItXCIsIFwiX1wiKVxuICAgIC50b0xvd2VyQ2FzZSgpXG5cbmFzeW5jIGZ1bmN0aW9uIHN1cHByZXNzPFQ+KG1vZDogUHJvbWlzZTx7IGRlZmF1bHQ6IFQgfT4sIHBhdGNoOiAobTogVCkgPT4gdm9pZCkge1xuICAgIHJldHVybiBtb2QudGhlbihtID0+IHBhdGNoKG0uZGVmYXVsdCkpLmNhdGNoKCgpID0+IHZvaWQgMClcbn1cblxuZnVuY3Rpb24gcGF0Y2g8UCBleHRlbmRzIG9iamVjdD4ocHJvdG86IFAsIHByb3A6IEV4dHJhY3Q8a2V5b2YgUCwgc3RyaW5nPikge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90bywgcHJvcCwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB0aGlzW2BnZXRfJHtzbmFrZWlmeShwcm9wKX1gXSgpIH0sXG4gICAgfSlcbn1cblxuYXdhaXQgc3VwcHJlc3MoaW1wb3J0KFwiZ2k6Ly9Bc3RhbEFwcHNcIiksICh7IEFwcHMsIEFwcGxpY2F0aW9uIH0pID0+IHtcbiAgICBwYXRjaChBcHBzLnByb3RvdHlwZSwgXCJsaXN0XCIpXG4gICAgcGF0Y2goQXBwbGljYXRpb24ucHJvdG90eXBlLCBcImtleXdvcmRzXCIpXG4gICAgcGF0Y2goQXBwbGljYXRpb24ucHJvdG90eXBlLCBcImNhdGVnb3JpZXNcIilcbn0pXG5cbmF3YWl0IHN1cHByZXNzKGltcG9ydChcImdpOi8vQXN0YWxCYXR0ZXJ5XCIpLCAoeyBVUG93ZXIgfSkgPT4ge1xuICAgIHBhdGNoKFVQb3dlci5wcm90b3R5cGUsIFwiZGV2aWNlc1wiKVxufSlcblxuYXdhaXQgc3VwcHJlc3MoaW1wb3J0KFwiZ2k6Ly9Bc3RhbEJsdWV0b290aFwiKSwgKHsgQWRhcHRlciwgQmx1ZXRvb3RoLCBEZXZpY2UgfSkgPT4ge1xuICAgIHBhdGNoKEFkYXB0ZXIucHJvdG90eXBlLCBcInV1aWRzXCIpXG4gICAgcGF0Y2goQmx1ZXRvb3RoLnByb3RvdHlwZSwgXCJhZGFwdGVyc1wiKVxuICAgIHBhdGNoKEJsdWV0b290aC5wcm90b3R5cGUsIFwiZGV2aWNlc1wiKVxuICAgIHBhdGNoKERldmljZS5wcm90b3R5cGUsIFwidXVpZHNcIilcbn0pXG5cbmF3YWl0IHN1cHByZXNzKGltcG9ydChcImdpOi8vQXN0YWxIeXBybGFuZFwiKSwgKHsgSHlwcmxhbmQsIE1vbml0b3IsIFdvcmtzcGFjZSB9KSA9PiB7XG4gICAgcGF0Y2goSHlwcmxhbmQucHJvdG90eXBlLCBcImJpbmRzXCIpXG4gICAgcGF0Y2goSHlwcmxhbmQucHJvdG90eXBlLCBcIm1vbml0b3JzXCIpXG4gICAgcGF0Y2goSHlwcmxhbmQucHJvdG90eXBlLCBcIndvcmtzcGFjZXNcIilcbiAgICBwYXRjaChIeXBybGFuZC5wcm90b3R5cGUsIFwiY2xpZW50c1wiKVxuICAgIHBhdGNoKE1vbml0b3IucHJvdG90eXBlLCBcImF2YWlsYWJsZU1vZGVzXCIpXG4gICAgcGF0Y2goTW9uaXRvci5wcm90b3R5cGUsIFwiYXZhaWxhYmxlX21vZGVzXCIpXG4gICAgcGF0Y2goV29ya3NwYWNlLnByb3RvdHlwZSwgXCJjbGllbnRzXCIpXG59KVxuXG5hd2FpdCBzdXBwcmVzcyhpbXBvcnQoXCJnaTovL0FzdGFsTXByaXNcIiksICh7IE1wcmlzLCBQbGF5ZXIgfSkgPT4ge1xuICAgIHBhdGNoKE1wcmlzLnByb3RvdHlwZSwgXCJwbGF5ZXJzXCIpXG4gICAgcGF0Y2goUGxheWVyLnByb3RvdHlwZSwgXCJzdXBwb3J0ZWRfdXJpX3NjaGVtZXNcIilcbiAgICBwYXRjaChQbGF5ZXIucHJvdG90eXBlLCBcInN1cHBvcnRlZFVyaVNjaGVtZXNcIilcbiAgICBwYXRjaChQbGF5ZXIucHJvdG90eXBlLCBcInN1cHBvcnRlZF9taW1lX3R5cGVzXCIpXG4gICAgcGF0Y2goUGxheWVyLnByb3RvdHlwZSwgXCJzdXBwb3J0ZWRNaW1lVHlwZXNcIilcbiAgICBwYXRjaChQbGF5ZXIucHJvdG90eXBlLCBcImNvbW1lbnRzXCIpXG59KVxuXG5hd2FpdCBzdXBwcmVzcyhpbXBvcnQoXCJnaTovL0FzdGFsTmV0d29ya1wiKSwgKHsgV2lmaSB9KSA9PiB7XG4gICAgcGF0Y2goV2lmaS5wcm90b3R5cGUsIFwiYWNjZXNzX3BvaW50c1wiKVxuICAgIHBhdGNoKFdpZmkucHJvdG90eXBlLCBcImFjY2Vzc1BvaW50c1wiKVxufSlcblxuYXdhaXQgc3VwcHJlc3MoaW1wb3J0KFwiZ2k6Ly9Bc3RhbE5vdGlmZFwiKSwgKHsgTm90aWZkLCBOb3RpZmljYXRpb24gfSkgPT4ge1xuICAgIHBhdGNoKE5vdGlmZC5wcm90b3R5cGUsIFwibm90aWZpY2F0aW9uc1wiKVxuICAgIHBhdGNoKE5vdGlmaWNhdGlvbi5wcm90b3R5cGUsIFwiYWN0aW9uc1wiKVxufSlcblxuYXdhaXQgc3VwcHJlc3MoaW1wb3J0KFwiZ2k6Ly9Bc3RhbFBvd2VyUHJvZmlsZXNcIiksICh7IFBvd2VyUHJvZmlsZXMgfSkgPT4ge1xuICAgIHBhdGNoKFBvd2VyUHJvZmlsZXMucHJvdG90eXBlLCBcImFjdGlvbnNcIilcbn0pXG5cbmF3YWl0IHN1cHByZXNzKGltcG9ydChcImdpOi8vQXN0YWxXcFwiKSwgKHsgV3AsIEF1ZGlvLCBWaWRlbywgTm9kZSwgRW5kcG9pbnQsIERldmljZSB9KSA9PiB7XG4gICAgcGF0Y2goV3AucHJvdG90eXBlLCBcIm5vZGVzXCIpXG4gICAgcGF0Y2goV3AucHJvdG90eXBlLCBcImRldmljZXNcIilcbiAgICBwYXRjaChBdWRpby5wcm90b3R5cGUsIFwic3RyZWFtc1wiKVxuICAgIHBhdGNoKEF1ZGlvLnByb3RvdHlwZSwgXCJyZWNvcmRlcnNcIilcbiAgICBwYXRjaChBdWRpby5wcm90b3R5cGUsIFwibWljcm9waG9uZXNcIilcbiAgICBwYXRjaChBdWRpby5wcm90b3R5cGUsIFwic3BlYWtlcnNcIilcbiAgICBwYXRjaChBdWRpby5wcm90b3R5cGUsIFwiZGV2aWNlc1wiKVxuICAgIHBhdGNoKFZpZGVvLnByb3RvdHlwZSwgXCJzdHJlYW1zXCIpXG4gICAgcGF0Y2goVmlkZW8ucHJvdG90eXBlLCBcInJlY29yZGVyc1wiKVxuICAgIHBhdGNoKFZpZGVvLnByb3RvdHlwZSwgXCJzaW5rc1wiKVxuICAgIHBhdGNoKFZpZGVvLnByb3RvdHlwZSwgXCJzb3VyY2VzXCIpXG4gICAgcGF0Y2goVmlkZW8ucHJvdG90eXBlLCBcImRldmljZXNcIilcbiAgICBwYXRjaChFbmRwb2ludC5wcm90b3R5cGUsIFwicm91dGVzXCIpXG4gICAgcGF0Y2goTm9kZS5wcm90b3R5cGUsIFwiY2hhbm5lbHNcIilcbiAgICBwYXRjaChEZXZpY2UucHJvdG90eXBlLCBcInByb2ZpbGVzXCIpXG4gICAgcGF0Y2goRGV2aWNlLnByb3RvdHlwZSwgXCJyb3V0ZXNcIilcbn0pXG4iLCAiaW1wb3J0IFwiLi9vdmVycmlkZXMuanNcIlxuaW1wb3J0IHsgc2V0Q29uc29sZUxvZ0RvbWFpbiB9IGZyb20gXCJjb25zb2xlXCJcbmltcG9ydCB7IGV4aXQsIHByb2dyYW1BcmdzIH0gZnJvbSBcInN5c3RlbVwiXG5pbXBvcnQgSU8gZnJvbSBcImdpOi8vQXN0YWxJT1wiXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCJcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvP3ZlcnNpb249Mi4wXCJcbmltcG9ydCB0eXBlIEFzdGFsMyBmcm9tIFwiZ2k6Ly9Bc3RhbD92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgdHlwZSBBc3RhbDQgZnJvbSBcImdpOi8vQXN0YWw/dmVyc2lvbj00LjBcIlxuXG50eXBlIENvbmZpZyA9IFBhcnRpYWw8e1xuICAgIGluc3RhbmNlTmFtZTogc3RyaW5nXG4gICAgY3NzOiBzdHJpbmdcbiAgICBpY29uczogc3RyaW5nXG4gICAgZ3RrVGhlbWU6IHN0cmluZ1xuICAgIGljb25UaGVtZTogc3RyaW5nXG4gICAgY3Vyc29yVGhlbWU6IHN0cmluZ1xuICAgIGhvbGQ6IGJvb2xlYW5cbiAgICByZXF1ZXN0SGFuZGxlcihyZXF1ZXN0OiBzdHJpbmcsIHJlczogKHJlc3BvbnNlOiBhbnkpID0+IHZvaWQpOiB2b2lkXG4gICAgbWFpbiguLi5hcmdzOiBzdHJpbmdbXSk6IHZvaWRcbiAgICBjbGllbnQobWVzc2FnZTogKG1zZzogc3RyaW5nKSA9PiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKTogdm9pZFxufT5cblxuaW50ZXJmYWNlIEFzdGFsM0pTIGV4dGVuZHMgQXN0YWwzLkFwcGxpY2F0aW9uIHtcbiAgICBldmFsKGJvZHk6IHN0cmluZyk6IFByb21pc2U8YW55PlxuICAgIHJlcXVlc3RIYW5kbGVyOiBDb25maWdbXCJyZXF1ZXN0SGFuZGxlclwiXVxuICAgIGFwcGx5X2NzcyhzdHlsZTogc3RyaW5nLCByZXNldD86IGJvb2xlYW4pOiB2b2lkXG4gICAgcXVpdChjb2RlPzogbnVtYmVyKTogdm9pZFxuICAgIHN0YXJ0KGNvbmZpZz86IENvbmZpZyk6IHZvaWRcbn1cblxuaW50ZXJmYWNlIEFzdGFsNEpTIGV4dGVuZHMgQXN0YWw0LkFwcGxpY2F0aW9uIHtcbiAgICBldmFsKGJvZHk6IHN0cmluZyk6IFByb21pc2U8YW55PlxuICAgIHJlcXVlc3RIYW5kbGVyPzogQ29uZmlnW1wicmVxdWVzdEhhbmRsZXJcIl1cbiAgICBhcHBseV9jc3Moc3R5bGU6IHN0cmluZywgcmVzZXQ/OiBib29sZWFuKTogdm9pZFxuICAgIHF1aXQoY29kZT86IG51bWJlcik6IHZvaWRcbiAgICBzdGFydChjb25maWc/OiBDb25maWcpOiB2b2lkXG59XG5cbnR5cGUgQXBwMyA9IHR5cGVvZiBBc3RhbDMuQXBwbGljYXRpb25cbnR5cGUgQXBwNCA9IHR5cGVvZiBBc3RhbDQuQXBwbGljYXRpb25cblxuZXhwb3J0IGZ1bmN0aW9uIG1rQXBwPEFwcCBleHRlbmRzIEFwcDM+KEFwcDogQXBwKTogQXN0YWwzSlNcbmV4cG9ydCBmdW5jdGlvbiBta0FwcDxBcHAgZXh0ZW5kcyBBcHA0PihBcHA6IEFwcCk6IEFzdGFsNEpTXG5cbmV4cG9ydCBmdW5jdGlvbiBta0FwcChBcHA6IEFwcDMgfCBBcHA0KSB7XG4gICAgcmV0dXJuIG5ldyAoY2xhc3MgQXN0YWxKUyBleHRlbmRzIEFwcCB7XG4gICAgICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJBc3RhbEpTXCIgfSwgdGhpcyBhcyBhbnkpIH1cblxuICAgICAgICBldmFsKGJvZHk6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZm4gPSBGdW5jdGlvbihgcmV0dXJuIChhc3luYyBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR7Ym9keS5pbmNsdWRlcyhcIjtcIikgPyBib2R5IDogYHJldHVybiAke2JvZHl9O2B9XG4gICAgICAgICAgICAgICAgICAgIH0pYClcbiAgICAgICAgICAgICAgICAgICAgZm4oKSgpLnRoZW4ocmVzKS5jYXRjaChyZWopXG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqKGVycm9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICByZXF1ZXN0SGFuZGxlcj86IENvbmZpZ1tcInJlcXVlc3RIYW5kbGVyXCJdXG5cbiAgICAgICAgdmZ1bmNfcmVxdWVzdChtc2c6IHN0cmluZywgY29ubjogR2lvLlNvY2tldENvbm5lY3Rpb24pOiB2b2lkIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5yZXF1ZXN0SGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXF1ZXN0SGFuZGxlcihtc2csIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBJTy53cml0ZV9zb2NrKGNvbm4sIFN0cmluZyhyZXNwb25zZSksIChfLCByZXMpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBJTy53cml0ZV9zb2NrX2ZpbmlzaChyZXMpLFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3VwZXIudmZ1bmNfcmVxdWVzdChtc2csIGNvbm4pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBhcHBseV9jc3Moc3R5bGU6IHN0cmluZywgcmVzZXQgPSBmYWxzZSkge1xuICAgICAgICAgICAgc3VwZXIuYXBwbHlfY3NzKHN0eWxlLCByZXNldClcbiAgICAgICAgfVxuXG4gICAgICAgIHF1aXQoY29kZT86IG51bWJlcik6IHZvaWQge1xuICAgICAgICAgICAgc3VwZXIucXVpdCgpXG4gICAgICAgICAgICBleGl0KGNvZGUgPz8gMClcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0KHsgcmVxdWVzdEhhbmRsZXIsIGNzcywgaG9sZCwgbWFpbiwgY2xpZW50LCBpY29ucywgLi4uY2ZnIH06IENvbmZpZyA9IHt9KSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSB0aGlzIGFzIHVua25vd24gYXMgSW5zdGFuY2VUeXBlPEFwcDMgfCBBcHA0PlxuXG4gICAgICAgICAgICBjbGllbnQgPz89ICgpID0+IHtcbiAgICAgICAgICAgICAgICBwcmludChgQXN0YWwgaW5zdGFuY2UgXCIke2FwcC5pbnN0YW5jZU5hbWV9XCIgYWxyZWFkeSBydW5uaW5nYClcbiAgICAgICAgICAgICAgICBleGl0KDEpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgY2ZnKVxuICAgICAgICAgICAgc2V0Q29uc29sZUxvZ0RvbWFpbihhcHAuaW5zdGFuY2VOYW1lKVxuXG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RIYW5kbGVyID0gcmVxdWVzdEhhbmRsZXJcbiAgICAgICAgICAgIGFwcC5jb25uZWN0KFwiYWN0aXZhdGVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIG1haW4/LiguLi5wcm9ncmFtQXJncylcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXBwLmFjcXVpcmVfc29ja2V0KClcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsaWVudChtc2cgPT4gSU8uc2VuZF9yZXF1ZXN0KGFwcC5pbnN0YW5jZU5hbWUsIG1zZykhLCAuLi5wcm9ncmFtQXJncylcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGx5X2Nzcyhjc3MsIGZhbHNlKVxuXG4gICAgICAgICAgICBpZiAoaWNvbnMpXG4gICAgICAgICAgICAgICAgYXBwLmFkZF9pY29ucyhpY29ucylcblxuICAgICAgICAgICAgaG9sZCA/Pz0gdHJ1ZVxuICAgICAgICAgICAgaWYgKGhvbGQpXG4gICAgICAgICAgICAgICAgYXBwLmhvbGQoKVxuXG4gICAgICAgICAgICBhcHAucnVuQXN5bmMoW10pXG4gICAgICAgIH1cbiAgICB9KVxufVxuIiwgImltcG9ydCBBc3RhbCBmcm9tIFwiZ2k6Ly9Bc3RhbD92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTQuMFwiXG5pbXBvcnQgYXN0YWxpZnksIHsgdHlwZSwgdHlwZSBDb25zdHJ1Y3RQcm9wcyB9IGZyb20gXCIuL2FzdGFsaWZ5LmpzXCJcblxuZnVuY3Rpb24gZmlsdGVyKGNoaWxkcmVuOiBhbnlbXSkge1xuICAgIHJldHVybiBjaGlsZHJlbi5mbGF0KEluZmluaXR5KS5tYXAoY2ggPT4gY2ggaW5zdGFuY2VvZiBHdGsuV2lkZ2V0XG4gICAgICAgID8gY2hcbiAgICAgICAgOiBuZXcgR3RrLkxhYmVsKHsgdmlzaWJsZTogdHJ1ZSwgbGFiZWw6IFN0cmluZyhjaCkgfSkpXG59XG5cbi8vIEJveFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEFzdGFsLkJveC5wcm90b3R5cGUsIFwiY2hpbGRyZW5cIiwge1xuICAgIGdldCgpIHsgcmV0dXJuIHRoaXMuZ2V0X2NoaWxkcmVuKCkgfSxcbiAgICBzZXQodikgeyB0aGlzLnNldF9jaGlsZHJlbih2KSB9LFxufSlcblxuZXhwb3J0IHR5cGUgQm94UHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxBc3RhbC5Cb3gsIEFzdGFsLkJveC5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IEJveCA9IGFzdGFsaWZ5PEFzdGFsLkJveCwgQXN0YWwuQm94LkNvbnN0cnVjdG9yUHJvcHM+KEFzdGFsLkJveCwge1xuICAgIGdldENoaWxkcmVuKHNlbGYpIHsgcmV0dXJuIHNlbGYuZ2V0X2NoaWxkcmVuKCkgfSxcbiAgICBzZXRDaGlsZHJlbihzZWxmLCBjaGlsZHJlbikgeyByZXR1cm4gc2VsZi5zZXRfY2hpbGRyZW4oZmlsdGVyKGNoaWxkcmVuKSkgfSxcbn0pXG5cbi8vIEJ1dHRvblxudHlwZSBCdXR0b25TaWduYWxzID0ge1xuICAgIG9uQ2xpY2tlZDogW11cbn1cblxuZXhwb3J0IHR5cGUgQnV0dG9uUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxHdGsuQnV0dG9uLCBHdGsuQnV0dG9uLkNvbnN0cnVjdG9yUHJvcHMsIEJ1dHRvblNpZ25hbHM+XG5leHBvcnQgY29uc3QgQnV0dG9uID0gYXN0YWxpZnk8R3RrLkJ1dHRvbiwgR3RrLkJ1dHRvbi5Db25zdHJ1Y3RvclByb3BzLCBCdXR0b25TaWduYWxzPihHdGsuQnV0dG9uKVxuXG4vLyBDZW50ZXJCb3hcbmV4cG9ydCB0eXBlIENlbnRlckJveFByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLkNlbnRlckJveCwgR3RrLkNlbnRlckJveC5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IENlbnRlckJveCA9IGFzdGFsaWZ5PEd0ay5DZW50ZXJCb3gsIEd0ay5DZW50ZXJCb3guQ29uc3RydWN0b3JQcm9wcz4oR3RrLkNlbnRlckJveCwge1xuICAgIGdldENoaWxkcmVuKGJveCkge1xuICAgICAgICByZXR1cm4gW2JveC5zdGFydFdpZGdldCwgYm94LmNlbnRlcldpZGdldCwgYm94LmVuZFdpZGdldF1cbiAgICB9LFxuICAgIHNldENoaWxkcmVuKGJveCwgY2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3QgY2ggPSBmaWx0ZXIoY2hpbGRyZW4pXG4gICAgICAgIGJveC5zdGFydFdpZGdldCA9IGNoWzBdIHx8IG5ldyBHdGsuQm94XG4gICAgICAgIGJveC5jZW50ZXJXaWRnZXQgPSBjaFsxXSB8fCBuZXcgR3RrLkJveFxuICAgICAgICBib3guZW5kV2lkZ2V0ID0gY2hbMl0gfHwgbmV3IEd0ay5Cb3hcbiAgICB9LFxufSlcblxuLy8gVE9ETzogQ2lyY3VsYXJQcm9ncmVzc1xuLy8gVE9ETzogRHJhd2luZ0FyZWFcblxuLy8gRW50cnlcbnR5cGUgRW50cnlTaWduYWxzID0ge1xuICAgIG9uQWN0aXZhdGU6IFtdXG4gICAgb25Ob3RpZnlUZXh0OiBbXVxufVxuXG5leHBvcnQgdHlwZSBFbnRyeVByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLkVudHJ5LCBHdGsuRW50cnkuQ29uc3RydWN0b3JQcm9wcywgRW50cnlTaWduYWxzPlxuZXhwb3J0IGNvbnN0IEVudHJ5ID0gYXN0YWxpZnk8R3RrLkVudHJ5LCBHdGsuRW50cnkuQ29uc3RydWN0b3JQcm9wcywgRW50cnlTaWduYWxzPihHdGsuRW50cnksIHtcbiAgICBnZXRDaGlsZHJlbigpIHsgcmV0dXJuIFtdIH0sXG59KVxuXG4vLyBJbWFnZVxuZXhwb3J0IHR5cGUgSW1hZ2VQcm9wcyA9IENvbnN0cnVjdFByb3BzPEd0ay5JbWFnZSwgR3RrLkltYWdlLkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY29uc3QgSW1hZ2UgPSBhc3RhbGlmeTxHdGsuSW1hZ2UsIEd0ay5JbWFnZS5Db25zdHJ1Y3RvclByb3BzPihHdGsuSW1hZ2UsIHtcbiAgICBnZXRDaGlsZHJlbigpIHsgcmV0dXJuIFtdIH0sXG59KVxuXG4vLyBMYWJlbFxuZXhwb3J0IHR5cGUgTGFiZWxQcm9wcyA9IENvbnN0cnVjdFByb3BzPEd0ay5MYWJlbCwgR3RrLkxhYmVsLkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY29uc3QgTGFiZWwgPSBhc3RhbGlmeTxHdGsuTGFiZWwsIEd0ay5MYWJlbC5Db25zdHJ1Y3RvclByb3BzPihHdGsuTGFiZWwsIHtcbiAgICBnZXRDaGlsZHJlbigpIHsgcmV0dXJuIFtdIH0sXG4gICAgc2V0Q2hpbGRyZW4oc2VsZiwgY2hpbGRyZW4pIHsgc2VsZi5sYWJlbCA9IFN0cmluZyhjaGlsZHJlbikgfSxcbn0pXG5cbi8vIExldmVsQmFyXG5leHBvcnQgdHlwZSBMZXZlbEJhclByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLkxldmVsQmFyLCBHdGsuTGV2ZWxCYXIuQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjb25zdCBMZXZlbEJhciA9IGFzdGFsaWZ5PEd0ay5MZXZlbEJhciwgR3RrLkxldmVsQmFyLkNvbnN0cnVjdG9yUHJvcHM+KEd0ay5MZXZlbEJhciwge1xuICAgIGdldENoaWxkcmVuKCkgeyByZXR1cm4gW10gfSxcbn0pXG5cbi8vIFRPRE86IExpc3RCb3hcblxuLy8gT3ZlcmxheVxuZXhwb3J0IHR5cGUgT3ZlcmxheVByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLk92ZXJsYXksIEd0ay5PdmVybGF5LkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY29uc3QgT3ZlcmxheSA9IGFzdGFsaWZ5PEd0ay5PdmVybGF5LCBHdGsuT3ZlcmxheS5Db25zdHJ1Y3RvclByb3BzPihHdGsuT3ZlcmxheSwge1xuICAgIGdldENoaWxkcmVuKHNlbGYpIHtcbiAgICAgICAgY29uc3QgY2hpbGRyZW46IEFycmF5PEd0ay5XaWRnZXQ+ID0gW11cbiAgICAgICAgbGV0IGNoID0gc2VsZi5nZXRfZmlyc3RfY2hpbGQoKVxuICAgICAgICB3aGlsZSAoY2ggIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goY2gpXG4gICAgICAgICAgICBjaCA9IGNoLmdldF9uZXh0X3NpYmxpbmcoKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuLmZpbHRlcihjaCA9PiBjaCAhPT0gc2VsZi5jaGlsZClcbiAgICB9LFxuICAgIHNldENoaWxkcmVuKHNlbGYsIGNoaWxkcmVuKSB7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2YgZmlsdGVyKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgY29uc3QgdHlwZXMgPSB0eXBlIGluIGNoaWxkXG4gICAgICAgICAgICAgICAgPyAoY2hpbGRbdHlwZV0gYXMgc3RyaW5nKS5zcGxpdCgvXFxzKy8pXG4gICAgICAgICAgICAgICAgOiBbXVxuXG4gICAgICAgICAgICBpZiAodHlwZXMuaW5jbHVkZXMoXCJvdmVybGF5XCIpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hZGRfb3ZlcmxheShjaGlsZClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRfY2hpbGQoY2hpbGQpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuc2V0X21lYXN1cmVfb3ZlcmxheShjaGlsZCwgdHlwZXMuaW5jbHVkZXMoXCJtZWFzdXJlXCIpKVxuICAgICAgICAgICAgc2VsZi5zZXRfY2xpcF9vdmVybGF5KGNoaWxkLCB0eXBlcy5pbmNsdWRlcyhcImNsaXBcIikpXG4gICAgICAgIH1cbiAgICB9LFxufSlcblxuLy8gUmV2ZWFsZXJcbmV4cG9ydCB0eXBlIFJldmVhbGVyUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxHdGsuUmV2ZWFsZXIsIEd0ay5SZXZlYWxlci5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IFJldmVhbGVyID0gYXN0YWxpZnk8R3RrLlJldmVhbGVyLCBHdGsuUmV2ZWFsZXIuQ29uc3RydWN0b3JQcm9wcz4oR3RrLlJldmVhbGVyKVxuXG4vLyBTbGlkZXJcbnR5cGUgU2xpZGVyU2lnbmFscyA9IHtcbiAgICBvbkNoYW5nZVZhbHVlOiBbXVxufVxuXG5leHBvcnQgdHlwZSBTbGlkZXJQcm9wcyA9IENvbnN0cnVjdFByb3BzPEFzdGFsLlNsaWRlciwgQXN0YWwuU2xpZGVyLkNvbnN0cnVjdG9yUHJvcHMsIFNsaWRlclNpZ25hbHM+XG5leHBvcnQgY29uc3QgU2xpZGVyID0gYXN0YWxpZnk8QXN0YWwuU2xpZGVyLCBBc3RhbC5TbGlkZXIuQ29uc3RydWN0b3JQcm9wcywgU2xpZGVyU2lnbmFscz4oQXN0YWwuU2xpZGVyLCB7XG4gICAgZ2V0Q2hpbGRyZW4oKSB7IHJldHVybiBbXSB9LFxufSlcblxuLy8gU3RhY2tcbmV4cG9ydCB0eXBlIFN0YWNrUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxHdGsuU3RhY2ssIEd0ay5TdGFjay5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IFN0YWNrID0gYXN0YWxpZnk8R3RrLlN0YWNrLCBHdGsuU3RhY2suQ29uc3RydWN0b3JQcm9wcz4oR3RrLlN0YWNrLCB7XG4gICAgc2V0Q2hpbGRyZW4oc2VsZiwgY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBmaWx0ZXIoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGQubmFtZSAhPSBcIlwiICYmIGNoaWxkLm5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHNlbGYuYWRkX25hbWVkKGNoaWxkLCBjaGlsZC5uYW1lKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmFkZF9jaGlsZChjaGlsZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG59KVxuXG4vLyBTd2l0Y2hcbmV4cG9ydCB0eXBlIFN3aXRjaFByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLlN3aXRjaCwgR3RrLlN3aXRjaC5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IFN3aXRjaCA9IGFzdGFsaWZ5PEd0ay5Td2l0Y2gsIEd0ay5Td2l0Y2guQ29uc3RydWN0b3JQcm9wcz4oR3RrLlN3aXRjaCwge1xuICAgIGdldENoaWxkcmVuKCkgeyByZXR1cm4gW10gfSxcbn0pXG5cbi8vIFdpbmRvd1xuZXhwb3J0IHR5cGUgV2luZG93UHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxBc3RhbC5XaW5kb3csIEFzdGFsLldpbmRvdy5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IFdpbmRvdyA9IGFzdGFsaWZ5PEFzdGFsLldpbmRvdywgQXN0YWwuV2luZG93LkNvbnN0cnVjdG9yUHJvcHM+KEFzdGFsLldpbmRvdylcblxuLy8gTWVudUJ1dHRvblxuZXhwb3J0IHR5cGUgTWVudUJ1dHRvblByb3BzID0gQ29uc3RydWN0UHJvcHM8R3RrLk1lbnVCdXR0b24sIEd0ay5NZW51QnV0dG9uLkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY29uc3QgTWVudUJ1dHRvbiA9IGFzdGFsaWZ5PEd0ay5NZW51QnV0dG9uLCBHdGsuTWVudUJ1dHRvbi5Db25zdHJ1Y3RvclByb3BzPihHdGsuTWVudUJ1dHRvbiwge1xuICAgIGdldENoaWxkcmVuKHNlbGYpIHsgcmV0dXJuIFtzZWxmLnBvcG92ZXIsIHNlbGYuY2hpbGRdIH0sXG4gICAgc2V0Q2hpbGRyZW4oc2VsZiwgY2hpbGRyZW4pIHtcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBmaWx0ZXIoY2hpbGRyZW4pKSB7XG4gICAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBHdGsuUG9wb3Zlcikge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0X3BvcG92ZXIoY2hpbGQpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0X2NoaWxkKGNoaWxkKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbn0pXG5cbi8vIFBvcG9wZXJcbmV4cG9ydCB0eXBlIFBvcG92ZXJQcm9wcyA9IENvbnN0cnVjdFByb3BzPEd0ay5Qb3BvdmVyLCBHdGsuUG9wb3Zlci5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNvbnN0IFBvcG92ZXIgPSBhc3RhbGlmeTxHdGsuUG9wb3ZlciwgR3RrLlBvcG92ZXIuQ29uc3RydWN0b3JQcm9wcz4oR3RrLlBvcG92ZXIpXG4iLCAid2luZG93LkJhciB7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBjb2xvcjogQHRoZW1lX2ZnX2NvbG9yO1xuICBmb250LXdlaWdodDogYm9sZDtcbn1cbndpbmRvdy5CYXIgPiBjZW50ZXJib3gge1xuICBiYWNrZ3JvdW5kOiBAdGhlbWVfYmdfY29sb3I7XG4gIGJvcmRlci1yYWRpdXM6IDEwcHg7XG4gIG1hcmdpbjogOHB4O1xufVxud2luZG93LkJhciBidXR0b24ge1xuICBib3JkZXItcmFkaXVzOiA4cHg7XG4gIG1hcmdpbjogMnB4O1xufSIsICJpbXBvcnQgXCIuL292ZXJyaWRlcy5qc1wiXG5leHBvcnQgeyBkZWZhdWx0IGFzIEFzdGFsSU8gfSBmcm9tIFwiZ2k6Ly9Bc3RhbElPP3ZlcnNpb249MC4xXCJcbmV4cG9ydCAqIGZyb20gXCIuL3Byb2Nlc3MuanNcIlxuZXhwb3J0ICogZnJvbSBcIi4vdGltZS5qc1wiXG5leHBvcnQgKiBmcm9tIFwiLi9maWxlLmpzXCJcbmV4cG9ydCAqIGZyb20gXCIuL2dvYmplY3QuanNcIlxuZXhwb3J0IHsgQmluZGluZywgYmluZCB9IGZyb20gXCIuL2JpbmRpbmcuanNcIlxuZXhwb3J0IHsgVmFyaWFibGUsIGRlcml2ZSB9IGZyb20gXCIuL3ZhcmlhYmxlLmpzXCJcbiIsICJpbXBvcnQgQXN0YWwgZnJvbSBcImdpOi8vQXN0YWxJT1wiXG5pbXBvcnQgR2lvIGZyb20gXCJnaTovL0dpbz92ZXJzaW9uPTIuMFwiXG5cbmV4cG9ydCB7IEdpbyB9XG5cbmV4cG9ydCBmdW5jdGlvbiByZWFkRmlsZShwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBBc3RhbC5yZWFkX2ZpbGUocGF0aCkgfHwgXCJcIlxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEZpbGVBc3luYyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIEFzdGFsLnJlYWRfZmlsZV9hc3luYyhwYXRoLCAoXywgcmVzKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoQXN0YWwucmVhZF9maWxlX2ZpbmlzaChyZXMpIHx8IFwiXCIpXG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVGaWxlKHBhdGg6IHN0cmluZywgY29udGVudDogc3RyaW5nKTogdm9pZCB7XG4gICAgQXN0YWwud3JpdGVfZmlsZShwYXRoLCBjb250ZW50KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd3JpdGVGaWxlQXN5bmMocGF0aDogc3RyaW5nLCBjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBBc3RhbC53cml0ZV9maWxlX2FzeW5jKHBhdGgsIGNvbnRlbnQsIChfLCByZXMpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShBc3RhbC53cml0ZV9maWxlX2ZpbmlzaChyZXMpKVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vbml0b3JGaWxlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjYWxsYmFjazogKGZpbGU6IHN0cmluZywgZXZlbnQ6IEdpby5GaWxlTW9uaXRvckV2ZW50KSA9PiB2b2lkLFxuKTogR2lvLkZpbGVNb25pdG9yIHtcbiAgICByZXR1cm4gQXN0YWwubW9uaXRvcl9maWxlKHBhdGgsIChmaWxlOiBzdHJpbmcsIGV2ZW50OiBHaW8uRmlsZU1vbml0b3JFdmVudCkgPT4ge1xuICAgICAgICBjYWxsYmFjayhmaWxlLCBldmVudClcbiAgICB9KSFcbn1cbiIsICJpbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCJcblxuZXhwb3J0IHsgZGVmYXVsdCBhcyBHTGliIH0gZnJvbSBcImdpOi8vR0xpYj92ZXJzaW9uPTIuMFwiXG5leHBvcnQgeyBHT2JqZWN0LCBHT2JqZWN0IGFzIGRlZmF1bHQgfVxuXG5jb25zdCBtZXRhID0gU3ltYm9sKFwibWV0YVwiKVxuY29uc3QgcHJpdiA9IFN5bWJvbChcInByaXZcIilcblxuY29uc3QgeyBQYXJhbVNwZWMsIFBhcmFtRmxhZ3MgfSA9IEdPYmplY3RcblxuY29uc3Qga2ViYWJpZnkgPSAoc3RyOiBzdHJpbmcpID0+IHN0clxuICAgIC5yZXBsYWNlKC8oW2Etel0pKFtBLVpdKS9nLCBcIiQxLSQyXCIpXG4gICAgLnJlcGxhY2VBbGwoXCJfXCIsIFwiLVwiKVxuICAgIC50b0xvd2VyQ2FzZSgpXG5cbnR5cGUgU2lnbmFsRGVjbGFyYXRpb24gPSB7XG4gICAgZmxhZ3M/OiBHT2JqZWN0LlNpZ25hbEZsYWdzXG4gICAgYWNjdW11bGF0b3I/OiBHT2JqZWN0LkFjY3VtdWxhdG9yVHlwZVxuICAgIHJldHVybl90eXBlPzogR09iamVjdC5HVHlwZVxuICAgIHBhcmFtX3R5cGVzPzogQXJyYXk8R09iamVjdC5HVHlwZT5cbn1cblxudHlwZSBQcm9wZXJ0eURlY2xhcmF0aW9uID1cbiAgICB8IEluc3RhbmNlVHlwZTx0eXBlb2YgR09iamVjdC5QYXJhbVNwZWM+XG4gICAgfCB7ICRndHlwZTogR09iamVjdC5HVHlwZSB9XG4gICAgfCB0eXBlb2YgU3RyaW5nXG4gICAgfCB0eXBlb2YgTnVtYmVyXG4gICAgfCB0eXBlb2YgQm9vbGVhblxuICAgIHwgdHlwZW9mIE9iamVjdFxuXG50eXBlIEdPYmplY3RDb25zdHJ1Y3RvciA9IHtcbiAgICBbbWV0YV0/OiB7XG4gICAgICAgIFByb3BlcnRpZXM/OiB7IFtrZXk6IHN0cmluZ106IEdPYmplY3QuUGFyYW1TcGVjIH1cbiAgICAgICAgU2lnbmFscz86IHsgW2tleTogc3RyaW5nXTogR09iamVjdC5TaWduYWxEZWZpbml0aW9uIH1cbiAgICB9XG4gICAgbmV3KC4uLmFyZ3M6IGFueVtdKTogYW55XG59XG5cbnR5cGUgTWV0YUluZm8gPSBHT2JqZWN0Lk1ldGFJbmZvPG5ldmVyLCBBcnJheTx7ICRndHlwZTogR09iamVjdC5HVHlwZSB9PiwgbmV2ZXI+XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlcihvcHRpb25zOiBNZXRhSW5mbyA9IHt9KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChjbHM6IEdPYmplY3RDb25zdHJ1Y3Rvcikge1xuICAgICAgICBjb25zdCB0ID0gb3B0aW9ucy5UZW1wbGF0ZVxuICAgICAgICBpZiAodHlwZW9mIHQgPT09IFwic3RyaW5nXCIgJiYgIXQuc3RhcnRzV2l0aChcInJlc291cmNlOi8vXCIpICYmICF0LnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgICAgICAgICAvLyBhc3N1bWUgeG1sIHRlbXBsYXRlXG4gICAgICAgICAgICBvcHRpb25zLlRlbXBsYXRlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKHQpXG4gICAgICAgIH1cblxuICAgICAgICBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3Moe1xuICAgICAgICAgICAgU2lnbmFsczogeyAuLi5jbHNbbWV0YV0/LlNpZ25hbHMgfSxcbiAgICAgICAgICAgIFByb3BlcnRpZXM6IHsgLi4uY2xzW21ldGFdPy5Qcm9wZXJ0aWVzIH0sXG4gICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICB9LCBjbHMpXG5cbiAgICAgICAgZGVsZXRlIGNsc1ttZXRhXVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3BlcnR5KGRlY2xhcmF0aW9uOiBQcm9wZXJ0eURlY2xhcmF0aW9uID0gT2JqZWN0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IGFueSwgcHJvcDogYW55LCBkZXNjPzogUHJvcGVydHlEZXNjcmlwdG9yKSB7XG4gICAgICAgIHRhcmdldC5jb25zdHJ1Y3RvclttZXRhXSA/Pz0ge31cbiAgICAgICAgdGFyZ2V0LmNvbnN0cnVjdG9yW21ldGFdLlByb3BlcnRpZXMgPz89IHt9XG5cbiAgICAgICAgY29uc3QgbmFtZSA9IGtlYmFiaWZ5KHByb3ApXG5cbiAgICAgICAgaWYgKCFkZXNjKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wLCB7XG4gICAgICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1twcml2XT8uW3Byb3BdID8/IGRlZmF1bHRWYWx1ZShkZWNsYXJhdGlvbilcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldCh2OiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT09IHRoaXNbcHJvcF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbcHJpdl0gPz89IHt9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzW3ByaXZdW3Byb3BdID0gdlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkobmFtZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBgc2V0XyR7bmFtZS5yZXBsYWNlKFwiLVwiLCBcIl9cIil9YCwge1xuICAgICAgICAgICAgICAgIHZhbHVlKHY6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzW3Byb3BdID0gdlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBgZ2V0XyR7bmFtZS5yZXBsYWNlKFwiLVwiLCBcIl9cIil9YCwge1xuICAgICAgICAgICAgICAgIHZhbHVlKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1twcm9wXVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICB0YXJnZXQuY29uc3RydWN0b3JbbWV0YV0uUHJvcGVydGllc1trZWJhYmlmeShwcm9wKV0gPSBwc3BlYyhuYW1lLCBQYXJhbUZsYWdzLlJFQURXUklURSwgZGVjbGFyYXRpb24pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgZmxhZ3MgPSAwXG4gICAgICAgICAgICBpZiAoZGVzYy5nZXQpIGZsYWdzIHw9IFBhcmFtRmxhZ3MuUkVBREFCTEVcbiAgICAgICAgICAgIGlmIChkZXNjLnNldCkgZmxhZ3MgfD0gUGFyYW1GbGFncy5XUklUQUJMRVxuXG4gICAgICAgICAgICB0YXJnZXQuY29uc3RydWN0b3JbbWV0YV0uUHJvcGVydGllc1trZWJhYmlmeShwcm9wKV0gPSBwc3BlYyhuYW1lLCBmbGFncywgZGVjbGFyYXRpb24pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWduYWwoLi4ucGFyYW1zOiBBcnJheTx7ICRndHlwZTogR09iamVjdC5HVHlwZSB9IHwgdHlwZW9mIE9iamVjdD4pOlxuKHRhcmdldDogYW55LCBzaWduYWw6IGFueSwgZGVzYz86IFByb3BlcnR5RGVzY3JpcHRvcikgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gc2lnbmFsKGRlY2xhcmF0aW9uPzogU2lnbmFsRGVjbGFyYXRpb24pOlxuKHRhcmdldDogYW55LCBzaWduYWw6IGFueSwgZGVzYz86IFByb3BlcnR5RGVzY3JpcHRvcikgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gc2lnbmFsKFxuICAgIGRlY2xhcmF0aW9uPzogU2lnbmFsRGVjbGFyYXRpb24gfCB7ICRndHlwZTogR09iamVjdC5HVHlwZSB9IHwgdHlwZW9mIE9iamVjdCxcbiAgICAuLi5wYXJhbXM6IEFycmF5PHsgJGd0eXBlOiBHT2JqZWN0LkdUeXBlIH0gfCB0eXBlb2YgT2JqZWN0PlxuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IGFueSwgc2lnbmFsOiBhbnksIGRlc2M/OiBQcm9wZXJ0eURlc2NyaXB0b3IpIHtcbiAgICAgICAgdGFyZ2V0LmNvbnN0cnVjdG9yW21ldGFdID8/PSB7fVxuICAgICAgICB0YXJnZXQuY29uc3RydWN0b3JbbWV0YV0uU2lnbmFscyA/Pz0ge31cblxuICAgICAgICBjb25zdCBuYW1lID0ga2ViYWJpZnkoc2lnbmFsKVxuXG4gICAgICAgIGlmIChkZWNsYXJhdGlvbiB8fCBwYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBUT0RPOiB0eXBlIGFzc2VydFxuICAgICAgICAgICAgY29uc3QgYXJyID0gW2RlY2xhcmF0aW9uLCAuLi5wYXJhbXNdLm1hcCh2ID0+IHYuJGd0eXBlKVxuICAgICAgICAgICAgdGFyZ2V0LmNvbnN0cnVjdG9yW21ldGFdLlNpZ25hbHNbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgcGFyYW1fdHlwZXM6IGFycixcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5jb25zdHJ1Y3RvclttZXRhXS5TaWduYWxzW25hbWVdID0gZGVjbGFyYXRpb24gfHwge1xuICAgICAgICAgICAgICAgIHBhcmFtX3R5cGVzOiBbXSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGVzYykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgc2lnbmFsLCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICguLi5hcmdzOiBhbnlbXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQobmFtZSwgLi4uYXJncylcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG9nOiAoKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKSA9IGRlc2MudmFsdWVcbiAgICAgICAgICAgIGRlc2MudmFsdWUgPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIG5vdCB0eXBlZFxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChuYW1lLCAuLi5hcmdzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgYG9uXyR7bmFtZS5yZXBsYWNlKFwiLVwiLCBcIl9cIil9YCwge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9nLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBzcGVjKG5hbWU6IHN0cmluZywgZmxhZ3M6IG51bWJlciwgZGVjbGFyYXRpb246IFByb3BlcnR5RGVjbGFyYXRpb24pIHtcbiAgICBpZiAoZGVjbGFyYXRpb24gaW5zdGFuY2VvZiBQYXJhbVNwZWMpXG4gICAgICAgIHJldHVybiBkZWNsYXJhdGlvblxuXG4gICAgc3dpdGNoIChkZWNsYXJhdGlvbikge1xuICAgICAgICBjYXNlIFN0cmluZzpcbiAgICAgICAgICAgIHJldHVybiBQYXJhbVNwZWMuc3RyaW5nKG5hbWUsIFwiXCIsIFwiXCIsIGZsYWdzLCBcIlwiKVxuICAgICAgICBjYXNlIE51bWJlcjpcbiAgICAgICAgICAgIHJldHVybiBQYXJhbVNwZWMuZG91YmxlKG5hbWUsIFwiXCIsIFwiXCIsIGZsYWdzLCAtTnVtYmVyLk1BWF9WQUxVRSwgTnVtYmVyLk1BWF9WQUxVRSwgMClcbiAgICAgICAgY2FzZSBCb29sZWFuOlxuICAgICAgICAgICAgcmV0dXJuIFBhcmFtU3BlYy5ib29sZWFuKG5hbWUsIFwiXCIsIFwiXCIsIGZsYWdzLCBmYWxzZSlcbiAgICAgICAgY2FzZSBPYmplY3Q6XG4gICAgICAgICAgICByZXR1cm4gUGFyYW1TcGVjLmpzb2JqZWN0KG5hbWUsIFwiXCIsIFwiXCIsIGZsYWdzKVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBtaXNzdHlwZWRcbiAgICAgICAgICAgIHJldHVybiBQYXJhbVNwZWMub2JqZWN0KG5hbWUsIFwiXCIsIFwiXCIsIGZsYWdzLCBkZWNsYXJhdGlvbi4kZ3R5cGUpXG4gICAgfVxufVxuXG5mdW5jdGlvbiBkZWZhdWx0VmFsdWUoZGVjbGFyYXRpb246IFByb3BlcnR5RGVjbGFyYXRpb24pIHtcbiAgICBpZiAoZGVjbGFyYXRpb24gaW5zdGFuY2VvZiBQYXJhbVNwZWMpXG4gICAgICAgIHJldHVybiBkZWNsYXJhdGlvbi5nZXRfZGVmYXVsdF92YWx1ZSgpXG5cbiAgICBzd2l0Y2ggKGRlY2xhcmF0aW9uKSB7XG4gICAgICAgIGNhc2UgU3RyaW5nOlxuICAgICAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgICAgY2FzZSBOdW1iZXI6XG4gICAgICAgICAgICByZXR1cm4gMFxuICAgICAgICBjYXNlIEJvb2xlYW46XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgY2FzZSBPYmplY3Q6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgIH1cbn1cbiIsICJmdW5jdGlvbiB0KGtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbWVzc2FnZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgXCJ3ZWxjb21lXCI6IFwiV2VsY29tZSB0byBBR1MhXCIsXG4gIH07XG4gIHJldHVybiBtZXNzYWdlc1trZXldID8/IGtleTtcbn1cblxuZXhwb3J0IHsgdCB9O1xuIiwgIi8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbmltcG9ydCBBc3RhbCBmcm9tIFwiZ2k6Ly9Bc3RhbD92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCJcbmltcG9ydCBhc3RhbGlmeSwgeyB0eXBlIENvbnN0cnVjdFByb3BzLCB0eXBlIEJpbmRhYmxlQ2hpbGQgfSBmcm9tIFwiLi9hc3RhbGlmeS5qc1wiXG5cbmZ1bmN0aW9uIGZpbHRlcihjaGlsZHJlbjogYW55W10pIHtcbiAgICByZXR1cm4gY2hpbGRyZW4uZmxhdChJbmZpbml0eSkubWFwKGNoID0+IGNoIGluc3RhbmNlb2YgR3RrLldpZGdldFxuICAgICAgICA/IGNoXG4gICAgICAgIDogbmV3IEd0ay5MYWJlbCh7IHZpc2libGU6IHRydWUsIGxhYmVsOiBTdHJpbmcoY2gpIH0pKVxufVxuXG4vLyBCb3hcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShBc3RhbC5Cb3gucHJvdG90eXBlLCBcImNoaWxkcmVuXCIsIHtcbiAgICBnZXQoKSB7IHJldHVybiB0aGlzLmdldF9jaGlsZHJlbigpIH0sXG4gICAgc2V0KHYpIHsgdGhpcy5zZXRfY2hpbGRyZW4odikgfSxcbn0pXG5cbmV4cG9ydCB0eXBlIEJveFByb3BzID0gQ29uc3RydWN0UHJvcHM8Qm94LCBBc3RhbC5Cb3guQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBCb3ggZXh0ZW5kcyBhc3RhbGlmeShBc3RhbC5Cb3gpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiQm94XCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogQm94UHJvcHMsIC4uLmNoaWxkcmVuOiBBcnJheTxCaW5kYWJsZUNoaWxkPikgeyBzdXBlcih7IGNoaWxkcmVuLCAuLi5wcm9wcyB9IGFzIGFueSkgfVxuICAgIHByb3RlY3RlZCBzZXRDaGlsZHJlbihjaGlsZHJlbjogYW55W10pOiB2b2lkIHsgdGhpcy5zZXRfY2hpbGRyZW4oZmlsdGVyKGNoaWxkcmVuKSkgfVxufVxuXG4vLyBCdXR0b25cbmV4cG9ydCB0eXBlIEJ1dHRvblByb3BzID0gQ29uc3RydWN0UHJvcHM8QnV0dG9uLCBBc3RhbC5CdXR0b24uQ29uc3RydWN0b3JQcm9wcywge1xuICAgIG9uQ2xpY2tlZDogW11cbiAgICBvbkNsaWNrOiBbZXZlbnQ6IEFzdGFsLkNsaWNrRXZlbnRdXG4gICAgb25DbGlja1JlbGVhc2U6IFtldmVudDogQXN0YWwuQ2xpY2tFdmVudF1cbiAgICBvbkhvdmVyOiBbZXZlbnQ6IEFzdGFsLkhvdmVyRXZlbnRdXG4gICAgb25Ib3Zlckxvc3Q6IFtldmVudDogQXN0YWwuSG92ZXJFdmVudF1cbiAgICBvblNjcm9sbDogW2V2ZW50OiBBc3RhbC5TY3JvbGxFdmVudF1cbn0+XG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuQnV0dG9uKSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIkJ1dHRvblwiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEJ1dHRvblByb3BzLCBjaGlsZD86IEJpbmRhYmxlQ2hpbGQpIHsgc3VwZXIoeyBjaGlsZCwgLi4ucHJvcHMgfSBhcyBhbnkpIH1cbn1cblxuLy8gQ2VudGVyQm94XG5leHBvcnQgdHlwZSBDZW50ZXJCb3hQcm9wcyA9IENvbnN0cnVjdFByb3BzPENlbnRlckJveCwgQXN0YWwuQ2VudGVyQm94LkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY2xhc3MgQ2VudGVyQm94IGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuQ2VudGVyQm94KSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIkNlbnRlckJveFwiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IENlbnRlckJveFByb3BzLCAuLi5jaGlsZHJlbjogQXJyYXk8QmluZGFibGVDaGlsZD4pIHsgc3VwZXIoeyBjaGlsZHJlbiwgLi4ucHJvcHMgfSBhcyBhbnkpIH1cbiAgICBwcm90ZWN0ZWQgc2V0Q2hpbGRyZW4oY2hpbGRyZW46IGFueVtdKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNoID0gZmlsdGVyKGNoaWxkcmVuKVxuICAgICAgICB0aGlzLnN0YXJ0V2lkZ2V0ID0gY2hbMF0gfHwgbmV3IEd0ay5Cb3hcbiAgICAgICAgdGhpcy5jZW50ZXJXaWRnZXQgPSBjaFsxXSB8fCBuZXcgR3RrLkJveFxuICAgICAgICB0aGlzLmVuZFdpZGdldCA9IGNoWzJdIHx8IG5ldyBHdGsuQm94XG4gICAgfVxufVxuXG4vLyBDaXJjdWxhclByb2dyZXNzXG5leHBvcnQgdHlwZSBDaXJjdWxhclByb2dyZXNzUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxDaXJjdWxhclByb2dyZXNzLCBBc3RhbC5DaXJjdWxhclByb2dyZXNzLkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY2xhc3MgQ2lyY3VsYXJQcm9ncmVzcyBleHRlbmRzIGFzdGFsaWZ5KEFzdGFsLkNpcmN1bGFyUHJvZ3Jlc3MpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiQ2lyY3VsYXJQcm9ncmVzc1wiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IENpcmN1bGFyUHJvZ3Jlc3NQcm9wcywgY2hpbGQ/OiBCaW5kYWJsZUNoaWxkKSB7IHN1cGVyKHsgY2hpbGQsIC4uLnByb3BzIH0gYXMgYW55KSB9XG59XG5cbi8vIERyYXdpbmdBcmVhXG5leHBvcnQgdHlwZSBEcmF3aW5nQXJlYVByb3BzID0gQ29uc3RydWN0UHJvcHM8RHJhd2luZ0FyZWEsIEd0ay5EcmF3aW5nQXJlYS5Db25zdHJ1Y3RvclByb3BzLCB7XG4gICAgb25EcmF3OiBbY3I6IGFueV0gLy8gVE9ETzogY2Fpcm8gdHlwZXNcbn0+XG5leHBvcnQgY2xhc3MgRHJhd2luZ0FyZWEgZXh0ZW5kcyBhc3RhbGlmeShHdGsuRHJhd2luZ0FyZWEpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiRHJhd2luZ0FyZWFcIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBEcmF3aW5nQXJlYVByb3BzKSB7IHN1cGVyKHByb3BzIGFzIGFueSkgfVxufVxuXG4vLyBFbnRyeVxuZXhwb3J0IHR5cGUgRW50cnlQcm9wcyA9IENvbnN0cnVjdFByb3BzPEVudHJ5LCBHdGsuRW50cnkuQ29uc3RydWN0b3JQcm9wcywge1xuICAgIG9uQ2hhbmdlZDogW11cbiAgICBvbkFjdGl2YXRlOiBbXVxufT5cbmV4cG9ydCBjbGFzcyBFbnRyeSBleHRlbmRzIGFzdGFsaWZ5KEd0ay5FbnRyeSkge1xuICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJFbnRyeVwiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEVudHJ5UHJvcHMpIHsgc3VwZXIocHJvcHMgYXMgYW55KSB9XG59XG5cbi8vIEV2ZW50Qm94XG5leHBvcnQgdHlwZSBFdmVudEJveFByb3BzID0gQ29uc3RydWN0UHJvcHM8RXZlbnRCb3gsIEFzdGFsLkV2ZW50Qm94LkNvbnN0cnVjdG9yUHJvcHMsIHtcbiAgICBvbkNsaWNrOiBbZXZlbnQ6IEFzdGFsLkNsaWNrRXZlbnRdXG4gICAgb25DbGlja1JlbGVhc2U6IFtldmVudDogQXN0YWwuQ2xpY2tFdmVudF1cbiAgICBvbkhvdmVyOiBbZXZlbnQ6IEFzdGFsLkhvdmVyRXZlbnRdXG4gICAgb25Ib3Zlckxvc3Q6IFtldmVudDogQXN0YWwuSG92ZXJFdmVudF1cbiAgICBvblNjcm9sbDogW2V2ZW50OiBBc3RhbC5TY3JvbGxFdmVudF1cbn0+XG5leHBvcnQgY2xhc3MgRXZlbnRCb3ggZXh0ZW5kcyBhc3RhbGlmeShBc3RhbC5FdmVudEJveCkge1xuICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJFdmVudEJveFwiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IEV2ZW50Qm94UHJvcHMsIGNoaWxkPzogQmluZGFibGVDaGlsZCkgeyBzdXBlcih7IGNoaWxkLCAuLi5wcm9wcyB9IGFzIGFueSkgfVxufVxuXG4vLyAvLyBUT0RPOiBGaXhlZFxuLy8gLy8gVE9ETzogRmxvd0JveFxuLy9cbi8vIEljb25cbmV4cG9ydCB0eXBlIEljb25Qcm9wcyA9IENvbnN0cnVjdFByb3BzPEljb24sIEFzdGFsLkljb24uQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBJY29uIGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuSWNvbikge1xuICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJJY29uXCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogSWNvblByb3BzKSB7IHN1cGVyKHByb3BzIGFzIGFueSkgfVxufVxuXG4vLyBMYWJlbFxuZXhwb3J0IHR5cGUgTGFiZWxQcm9wcyA9IENvbnN0cnVjdFByb3BzPExhYmVsLCBBc3RhbC5MYWJlbC5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNsYXNzIExhYmVsIGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuTGFiZWwpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiTGFiZWxcIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBMYWJlbFByb3BzKSB7IHN1cGVyKHByb3BzIGFzIGFueSkgfVxuICAgIHByb3RlY3RlZCBzZXRDaGlsZHJlbihjaGlsZHJlbjogYW55W10pOiB2b2lkIHsgdGhpcy5sYWJlbCA9IFN0cmluZyhjaGlsZHJlbikgfVxufVxuXG4vLyBMZXZlbEJhclxuZXhwb3J0IHR5cGUgTGV2ZWxCYXJQcm9wcyA9IENvbnN0cnVjdFByb3BzPExldmVsQmFyLCBBc3RhbC5MZXZlbEJhci5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNsYXNzIExldmVsQmFyIGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuTGV2ZWxCYXIpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiTGV2ZWxCYXJcIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBMZXZlbEJhclByb3BzKSB7IHN1cGVyKHByb3BzIGFzIGFueSkgfVxufVxuXG4vLyBUT0RPOiBMaXN0Qm94XG5cbi8vIE1lbnVCdXR0b25cbmV4cG9ydCB0eXBlIE1lbnVCdXR0b25Qcm9wcyA9IENvbnN0cnVjdFByb3BzPE1lbnVCdXR0b24sIEd0ay5NZW51QnV0dG9uLkNvbnN0cnVjdG9yUHJvcHM+XG5leHBvcnQgY2xhc3MgTWVudUJ1dHRvbiBleHRlbmRzIGFzdGFsaWZ5KEd0ay5NZW51QnV0dG9uKSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIk1lbnVCdXR0b25cIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBNZW51QnV0dG9uUHJvcHMsIGNoaWxkPzogQmluZGFibGVDaGlsZCkgeyBzdXBlcih7IGNoaWxkLCAuLi5wcm9wcyB9IGFzIGFueSkgfVxufVxuXG4vLyBPdmVybGF5XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQXN0YWwuT3ZlcmxheS5wcm90b3R5cGUsIFwib3ZlcmxheXNcIiwge1xuICAgIGdldCgpIHsgcmV0dXJuIHRoaXMuZ2V0X292ZXJsYXlzKCkgfSxcbiAgICBzZXQodikgeyB0aGlzLnNldF9vdmVybGF5cyh2KSB9LFxufSlcblxuZXhwb3J0IHR5cGUgT3ZlcmxheVByb3BzID0gQ29uc3RydWN0UHJvcHM8T3ZlcmxheSwgQXN0YWwuT3ZlcmxheS5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNsYXNzIE92ZXJsYXkgZXh0ZW5kcyBhc3RhbGlmeShBc3RhbC5PdmVybGF5KSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIk92ZXJsYXlcIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBPdmVybGF5UHJvcHMsIC4uLmNoaWxkcmVuOiBBcnJheTxCaW5kYWJsZUNoaWxkPikgeyBzdXBlcih7IGNoaWxkcmVuLCAuLi5wcm9wcyB9IGFzIGFueSkgfVxuICAgIHByb3RlY3RlZCBzZXRDaGlsZHJlbihjaGlsZHJlbjogYW55W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgW2NoaWxkLCAuLi5vdmVybGF5c10gPSBmaWx0ZXIoY2hpbGRyZW4pXG4gICAgICAgIHRoaXMuc2V0X2NoaWxkKGNoaWxkKVxuICAgICAgICB0aGlzLnNldF9vdmVybGF5cyhvdmVybGF5cylcbiAgICB9XG59XG5cbi8vIFJldmVhbGVyXG5leHBvcnQgdHlwZSBSZXZlYWxlclByb3BzID0gQ29uc3RydWN0UHJvcHM8UmV2ZWFsZXIsIEd0ay5SZXZlYWxlci5Db25zdHJ1Y3RvclByb3BzPlxuZXhwb3J0IGNsYXNzIFJldmVhbGVyIGV4dGVuZHMgYXN0YWxpZnkoR3RrLlJldmVhbGVyKSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIlJldmVhbGVyXCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogUmV2ZWFsZXJQcm9wcywgY2hpbGQ/OiBCaW5kYWJsZUNoaWxkKSB7IHN1cGVyKHsgY2hpbGQsIC4uLnByb3BzIH0gYXMgYW55KSB9XG59XG5cbi8vIFNjcm9sbGFibGVcbmV4cG9ydCB0eXBlIFNjcm9sbGFibGVQcm9wcyA9IENvbnN0cnVjdFByb3BzPFNjcm9sbGFibGUsIEFzdGFsLlNjcm9sbGFibGUuQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBTY3JvbGxhYmxlIGV4dGVuZHMgYXN0YWxpZnkoQXN0YWwuU2Nyb2xsYWJsZSkge1xuICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJTY3JvbGxhYmxlXCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogU2Nyb2xsYWJsZVByb3BzLCBjaGlsZD86IEJpbmRhYmxlQ2hpbGQpIHsgc3VwZXIoeyBjaGlsZCwgLi4ucHJvcHMgfSBhcyBhbnkpIH1cbn1cblxuLy8gU2xpZGVyXG5leHBvcnQgdHlwZSBTbGlkZXJQcm9wcyA9IENvbnN0cnVjdFByb3BzPFNsaWRlciwgQXN0YWwuU2xpZGVyLkNvbnN0cnVjdG9yUHJvcHMsIHtcbiAgICBvbkRyYWdnZWQ6IFtdXG59PlxuZXhwb3J0IGNsYXNzIFNsaWRlciBleHRlbmRzIGFzdGFsaWZ5KEFzdGFsLlNsaWRlcikge1xuICAgIHN0YXRpYyB7IEdPYmplY3QucmVnaXN0ZXJDbGFzcyh7IEdUeXBlTmFtZTogXCJTbGlkZXJcIiB9LCB0aGlzKSB9XG4gICAgY29uc3RydWN0b3IocHJvcHM/OiBTbGlkZXJQcm9wcykgeyBzdXBlcihwcm9wcyBhcyBhbnkpIH1cbn1cblxuLy8gU3RhY2tcbmV4cG9ydCB0eXBlIFN0YWNrUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxTdGFjaywgQXN0YWwuU3RhY2suQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBTdGFjayBleHRlbmRzIGFzdGFsaWZ5KEFzdGFsLlN0YWNrKSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIlN0YWNrXCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogU3RhY2tQcm9wcywgLi4uY2hpbGRyZW46IEFycmF5PEJpbmRhYmxlQ2hpbGQ+KSB7IHN1cGVyKHsgY2hpbGRyZW4sIC4uLnByb3BzIH0gYXMgYW55KSB9XG4gICAgcHJvdGVjdGVkIHNldENoaWxkcmVuKGNoaWxkcmVuOiBhbnlbXSk6IHZvaWQgeyB0aGlzLnNldF9jaGlsZHJlbihmaWx0ZXIoY2hpbGRyZW4pKSB9XG59XG5cbi8vIFN3aXRjaFxuZXhwb3J0IHR5cGUgU3dpdGNoUHJvcHMgPSBDb25zdHJ1Y3RQcm9wczxTd2l0Y2gsIEd0ay5Td2l0Y2guQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBTd2l0Y2ggZXh0ZW5kcyBhc3RhbGlmeShHdGsuU3dpdGNoKSB7XG4gICAgc3RhdGljIHsgR09iamVjdC5yZWdpc3RlckNsYXNzKHsgR1R5cGVOYW1lOiBcIlN3aXRjaFwiIH0sIHRoaXMpIH1cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcz86IFN3aXRjaFByb3BzKSB7IHN1cGVyKHByb3BzIGFzIGFueSkgfVxufVxuXG4vLyBXaW5kb3dcbmV4cG9ydCB0eXBlIFdpbmRvd1Byb3BzID0gQ29uc3RydWN0UHJvcHM8V2luZG93LCBBc3RhbC5XaW5kb3cuQ29uc3RydWN0b3JQcm9wcz5cbmV4cG9ydCBjbGFzcyBXaW5kb3cgZXh0ZW5kcyBhc3RhbGlmeShBc3RhbC5XaW5kb3cpIHtcbiAgICBzdGF0aWMgeyBHT2JqZWN0LnJlZ2lzdGVyQ2xhc3MoeyBHVHlwZU5hbWU6IFwiV2luZG93XCIgfSwgdGhpcykgfVxuICAgIGNvbnN0cnVjdG9yKHByb3BzPzogV2luZG93UHJvcHMsIGNoaWxkPzogQmluZGFibGVDaGlsZCkgeyBzdXBlcih7IGNoaWxkLCAuLi5wcm9wcyB9IGFzIGFueSkgfVxufVxuIiwgImltcG9ydCB7IGhvb2ssIG5vSW1wbGljaXREZXN0cm95LCBzZXRDaGlsZHJlbiwgbWVyZ2VCaW5kaW5ncywgdHlwZSBCaW5kYWJsZVByb3BzLCBjb25zdHJ1Y3QgfSBmcm9tIFwiLi4vX2FzdGFsLmpzXCJcbmltcG9ydCBBc3RhbCBmcm9tIFwiZ2k6Ly9Bc3RhbD92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgR2RrIGZyb20gXCJnaTovL0dkaz92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgR09iamVjdCBmcm9tIFwiZ2k6Ly9HT2JqZWN0XCJcbmltcG9ydCBHaW8gZnJvbSBcImdpOi8vR2lvP3ZlcnNpb249Mi4wXCJcbmltcG9ydCBCaW5kaW5nLCB7IHR5cGUgQ29ubmVjdGFibGUsIHR5cGUgU3Vic2NyaWJhYmxlIH0gZnJvbSBcIi4uL2JpbmRpbmcuanNcIlxuXG5leHBvcnQgeyBCaW5kYWJsZVByb3BzLCBtZXJnZUJpbmRpbmdzIH1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXN0YWxpZnk8XG4gICAgQyBleHRlbmRzIHsgbmV3KC4uLmFyZ3M6IGFueVtdKTogR3RrLldpZGdldCB9LFxuPihjbHM6IEMsIGNsc05hbWUgPSBjbHMubmFtZSkge1xuICAgIGNsYXNzIFdpZGdldCBleHRlbmRzIGNscyB7XG4gICAgICAgIGdldCBjc3MoKTogc3RyaW5nIHsgcmV0dXJuIEFzdGFsLndpZGdldF9nZXRfY3NzKHRoaXMpIH1cbiAgICAgICAgc2V0IGNzcyhjc3M6IHN0cmluZykgeyBBc3RhbC53aWRnZXRfc2V0X2Nzcyh0aGlzLCBjc3MpIH1cbiAgICAgICAgZ2V0X2NzcygpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5jc3MgfVxuICAgICAgICBzZXRfY3NzKGNzczogc3RyaW5nKSB7IHRoaXMuY3NzID0gY3NzIH1cblxuICAgICAgICBnZXQgY2xhc3NOYW1lKCk6IHN0cmluZyB7IHJldHVybiBBc3RhbC53aWRnZXRfZ2V0X2NsYXNzX25hbWVzKHRoaXMpLmpvaW4oXCIgXCIpIH1cbiAgICAgICAgc2V0IGNsYXNzTmFtZShjbGFzc05hbWU6IHN0cmluZykgeyBBc3RhbC53aWRnZXRfc2V0X2NsYXNzX25hbWVzKHRoaXMsIGNsYXNzTmFtZS5zcGxpdCgvXFxzKy8pKSB9XG4gICAgICAgIGdldF9jbGFzc19uYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmNsYXNzTmFtZSB9XG4gICAgICAgIHNldF9jbGFzc19uYW1lKGNsYXNzTmFtZTogc3RyaW5nKSB7IHRoaXMuY2xhc3NOYW1lID0gY2xhc3NOYW1lIH1cblxuICAgICAgICBnZXQgY3Vyc29yKCk6IEN1cnNvciB7IHJldHVybiBBc3RhbC53aWRnZXRfZ2V0X2N1cnNvcih0aGlzKSBhcyBDdXJzb3IgfVxuICAgICAgICBzZXQgY3Vyc29yKGN1cnNvcjogQ3Vyc29yKSB7IEFzdGFsLndpZGdldF9zZXRfY3Vyc29yKHRoaXMsIGN1cnNvcikgfVxuICAgICAgICBnZXRfY3Vyc29yKCk6IEN1cnNvciB7IHJldHVybiB0aGlzLmN1cnNvciB9XG4gICAgICAgIHNldF9jdXJzb3IoY3Vyc29yOiBDdXJzb3IpIHsgdGhpcy5jdXJzb3IgPSBjdXJzb3IgfVxuXG4gICAgICAgIGdldCBjbGlja1Rocm91Z2goKTogYm9vbGVhbiB7IHJldHVybiBBc3RhbC53aWRnZXRfZ2V0X2NsaWNrX3Rocm91Z2godGhpcykgfVxuICAgICAgICBzZXQgY2xpY2tUaHJvdWdoKGNsaWNrVGhyb3VnaDogYm9vbGVhbikgeyBBc3RhbC53aWRnZXRfc2V0X2NsaWNrX3Rocm91Z2godGhpcywgY2xpY2tUaHJvdWdoKSB9XG4gICAgICAgIGdldF9jbGlja190aHJvdWdoKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5jbGlja1Rocm91Z2ggfVxuICAgICAgICBzZXRfY2xpY2tfdGhyb3VnaChjbGlja1Rocm91Z2g6IGJvb2xlYW4pIHsgdGhpcy5jbGlja1Rocm91Z2ggPSBjbGlja1Rocm91Z2ggfVxuXG4gICAgICAgIGRlY2xhcmUgcHJpdmF0ZSBbbm9JbXBsaWNpdERlc3Ryb3ldOiBib29sZWFuXG4gICAgICAgIGdldCBub0ltcGxpY2l0RGVzdHJveSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXNbbm9JbXBsaWNpdERlc3Ryb3ldIH1cbiAgICAgICAgc2V0IG5vSW1wbGljaXREZXN0cm95KHZhbHVlOiBib29sZWFuKSB7IHRoaXNbbm9JbXBsaWNpdERlc3Ryb3ldID0gdmFsdWUgfVxuXG4gICAgICAgIHNldCBhY3Rpb25Hcm91cChbcHJlZml4LCBncm91cF06IEFjdGlvbkdyb3VwKSB7IHRoaXMuaW5zZXJ0X2FjdGlvbl9ncm91cChwcmVmaXgsIGdyb3VwKSB9XG4gICAgICAgIHNldF9hY3Rpb25fZ3JvdXAoYWN0aW9uR3JvdXA6IEFjdGlvbkdyb3VwKSB7IHRoaXMuYWN0aW9uR3JvdXAgPSBhY3Rpb25Hcm91cCB9XG5cbiAgICAgICAgcHJvdGVjdGVkIGdldENoaWxkcmVuKCk6IEFycmF5PEd0ay5XaWRnZXQ+IHtcbiAgICAgICAgICAgIGlmICh0aGlzIGluc3RhbmNlb2YgR3RrLkJpbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldF9jaGlsZCgpID8gW3RoaXMuZ2V0X2NoaWxkKCkhXSA6IFtdXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBHdGsuQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0X2NoaWxkcmVuKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9XG5cbiAgICAgICAgcHJvdGVjdGVkIHNldENoaWxkcmVuKGNoaWxkcmVuOiBhbnlbXSkge1xuICAgICAgICAgICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5mbGF0KEluZmluaXR5KS5tYXAoY2ggPT4gY2ggaW5zdGFuY2VvZiBHdGsuV2lkZ2V0XG4gICAgICAgICAgICAgICAgPyBjaFxuICAgICAgICAgICAgICAgIDogbmV3IEd0ay5MYWJlbCh7IHZpc2libGU6IHRydWUsIGxhYmVsOiBTdHJpbmcoY2gpIH0pKVxuXG4gICAgICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEd0ay5Db250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIGNoaWxkcmVuKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZChjaClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoYGNhbiBub3QgYWRkIGNoaWxkcmVuIHRvICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfWApXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBbc2V0Q2hpbGRyZW5dKGNoaWxkcmVuOiBhbnlbXSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlXG4gICAgICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIEd0ay5Db250YWluZXIpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoIG9mIHRoaXMuZ2V0Q2hpbGRyZW4oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZShjaClcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjaGlsZHJlbi5pbmNsdWRlcyhjaCkgJiYgIXRoaXMubm9JbXBsaWNpdERlc3Ryb3kpXG4gICAgICAgICAgICAgICAgICAgICAgICBjaD8uZGVzdHJveSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBhcHBlbmRcbiAgICAgICAgICAgIHRoaXMuc2V0Q2hpbGRyZW4oY2hpbGRyZW4pXG4gICAgICAgIH1cblxuICAgICAgICB0b2dnbGVDbGFzc05hbWUoY246IHN0cmluZywgY29uZCA9IHRydWUpIHtcbiAgICAgICAgICAgIEFzdGFsLndpZGdldF90b2dnbGVfY2xhc3NfbmFtZSh0aGlzLCBjbiwgY29uZClcbiAgICAgICAgfVxuXG4gICAgICAgIGhvb2soXG4gICAgICAgICAgICBvYmplY3Q6IENvbm5lY3RhYmxlLFxuICAgICAgICAgICAgc2lnbmFsOiBzdHJpbmcsXG4gICAgICAgICAgICBjYWxsYmFjazogKHNlbGY6IHRoaXMsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLFxuICAgICAgICApOiB0aGlzXG4gICAgICAgIGhvb2soXG4gICAgICAgICAgICBvYmplY3Q6IFN1YnNjcmliYWJsZSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAoc2VsZjogdGhpcywgLi4uYXJnczogYW55W10pID0+IHZvaWQsXG4gICAgICAgICk6IHRoaXNcbiAgICAgICAgaG9vayhcbiAgICAgICAgICAgIG9iamVjdDogQ29ubmVjdGFibGUgfCBTdWJzY3JpYmFibGUsXG4gICAgICAgICAgICBzaWduYWxPckNhbGxiYWNrOiBzdHJpbmcgfCAoKHNlbGY6IHRoaXMsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkKSxcbiAgICAgICAgICAgIGNhbGxiYWNrPzogKHNlbGY6IHRoaXMsIC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkLFxuICAgICAgICApIHtcbiAgICAgICAgICAgIGhvb2sodGhpcywgb2JqZWN0LCBzaWduYWxPckNhbGxiYWNrLCBjYWxsYmFjaylcbiAgICAgICAgICAgIHJldHVybiB0aGlzXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdHJ1Y3RvciguLi5wYXJhbXM6IGFueVtdKSB7XG4gICAgICAgICAgICBzdXBlcigpXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHBhcmFtc1swXSB8fCB7fVxuICAgICAgICAgICAgcHJvcHMudmlzaWJsZSA/Pz0gdHJ1ZVxuICAgICAgICAgICAgY29uc3RydWN0KHRoaXMsIHByb3BzKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgR09iamVjdC5yZWdpc3RlckNsYXNzKHtcbiAgICAgICAgR1R5cGVOYW1lOiBgQXN0YWxfJHtjbHNOYW1lfWAsXG4gICAgICAgIFByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIFwiY2xhc3MtbmFtZVwiOiBHT2JqZWN0LlBhcmFtU3BlYy5zdHJpbmcoXG4gICAgICAgICAgICAgICAgXCJjbGFzcy1uYW1lXCIsIFwiXCIsIFwiXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgXCJjc3NcIjogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFxuICAgICAgICAgICAgICAgIFwiY3NzXCIsIFwiXCIsIFwiXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiXCIsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgXCJjdXJzb3JcIjogR09iamVjdC5QYXJhbVNwZWMuc3RyaW5nKFxuICAgICAgICAgICAgICAgIFwiY3Vyc29yXCIsIFwiXCIsIFwiXCIsIEdPYmplY3QuUGFyYW1GbGFncy5SRUFEV1JJVEUsIFwiZGVmYXVsdFwiLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIFwiY2xpY2stdGhyb3VnaFwiOiBHT2JqZWN0LlBhcmFtU3BlYy5ib29sZWFuKFxuICAgICAgICAgICAgICAgIFwiY2xpY2stdGhyb3VnaFwiLCBcIlwiLCBcIlwiLCBHT2JqZWN0LlBhcmFtRmxhZ3MuUkVBRFdSSVRFLCBmYWxzZSxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBcIm5vLWltcGxpY2l0LWRlc3Ryb3lcIjogR09iamVjdC5QYXJhbVNwZWMuYm9vbGVhbihcbiAgICAgICAgICAgICAgICBcIm5vLWltcGxpY2l0LWRlc3Ryb3lcIiwgXCJcIiwgXCJcIiwgR09iamVjdC5QYXJhbUZsYWdzLlJFQURXUklURSwgZmFsc2UsXG4gICAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgIH0sIFdpZGdldClcblxuICAgIHJldHVybiBXaWRnZXRcbn1cblxudHlwZSBTaWdIYW5kbGVyPFxuICAgIFcgZXh0ZW5kcyBJbnN0YW5jZVR5cGU8dHlwZW9mIEd0ay5XaWRnZXQ+LFxuICAgIEFyZ3MgZXh0ZW5kcyBBcnJheTx1bmtub3duPixcbj4gPSAoKHNlbGY6IFcsIC4uLmFyZ3M6IEFyZ3MpID0+IHVua25vd24pIHwgc3RyaW5nIHwgc3RyaW5nW11cblxuZXhwb3J0IHR5cGUgQmluZGFibGVDaGlsZCA9IEd0ay5XaWRnZXQgfCBCaW5kaW5nPEd0ay5XaWRnZXQ+XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdFByb3BzPFxuICAgIFNlbGYgZXh0ZW5kcyBJbnN0YW5jZVR5cGU8dHlwZW9mIEd0ay5XaWRnZXQ+LFxuICAgIFByb3BzIGV4dGVuZHMgR3RrLldpZGdldC5Db25zdHJ1Y3RvclByb3BzLFxuICAgIFNpZ25hbHMgZXh0ZW5kcyBSZWNvcmQ8YG9uJHtzdHJpbmd9YCwgQXJyYXk8dW5rbm93bj4+ID0gUmVjb3JkPGBvbiR7c3RyaW5nfWAsIGFueVtdPixcbj4gPSBQYXJ0aWFsPHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIGNhbid0IGFzc2lnbiB0byB1bmtub3duLCBidXQgaXQgd29ya3MgYXMgZXhwZWN0ZWQgdGhvdWdoXG4gICAgW1MgaW4ga2V5b2YgU2lnbmFsc106IFNpZ0hhbmRsZXI8U2VsZiwgU2lnbmFsc1tTXT5cbn0+ICYgUGFydGlhbDx7XG4gICAgW0tleSBpbiBgb24ke3N0cmluZ31gXTogU2lnSGFuZGxlcjxTZWxmLCBhbnlbXT5cbn0+ICYgQmluZGFibGVQcm9wczxQYXJ0aWFsPFByb3BzICYge1xuICAgIGNsYXNzTmFtZT86IHN0cmluZ1xuICAgIGNzcz86IHN0cmluZ1xuICAgIGN1cnNvcj86IHN0cmluZ1xuICAgIGNsaWNrVGhyb3VnaD86IGJvb2xlYW5cbiAgICBhY3Rpb25Hcm91cD86IEFjdGlvbkdyb3VwXG59Pj4gJiBQYXJ0aWFsPHtcbiAgICBvbkRlc3Ryb3k6IChzZWxmOiBTZWxmKSA9PiB1bmtub3duXG4gICAgb25EcmF3OiAoc2VsZjogU2VsZikgPT4gdW5rbm93blxuICAgIG9uS2V5UHJlc3NFdmVudDogKHNlbGY6IFNlbGYsIGV2ZW50OiBHZGsuRXZlbnQpID0+IHVua25vd25cbiAgICBvbktleVJlbGVhc2VFdmVudDogKHNlbGY6IFNlbGYsIGV2ZW50OiBHZGsuRXZlbnQpID0+IHVua25vd25cbiAgICBvbkJ1dHRvblByZXNzRXZlbnQ6IChzZWxmOiBTZWxmLCBldmVudDogR2RrLkV2ZW50KSA9PiB1bmtub3duXG4gICAgb25CdXR0b25SZWxlYXNlRXZlbnQ6IChzZWxmOiBTZWxmLCBldmVudDogR2RrLkV2ZW50KSA9PiB1bmtub3duXG4gICAgb25SZWFsaXplOiAoc2VsZjogU2VsZikgPT4gdW5rbm93blxuICAgIHNldHVwOiAoc2VsZjogU2VsZikgPT4gdm9pZFxufT5cblxudHlwZSBDdXJzb3IgPVxuICAgIHwgXCJkZWZhdWx0XCJcbiAgICB8IFwiaGVscFwiXG4gICAgfCBcInBvaW50ZXJcIlxuICAgIHwgXCJjb250ZXh0LW1lbnVcIlxuICAgIHwgXCJwcm9ncmVzc1wiXG4gICAgfCBcIndhaXRcIlxuICAgIHwgXCJjZWxsXCJcbiAgICB8IFwiY3Jvc3NoYWlyXCJcbiAgICB8IFwidGV4dFwiXG4gICAgfCBcInZlcnRpY2FsLXRleHRcIlxuICAgIHwgXCJhbGlhc1wiXG4gICAgfCBcImNvcHlcIlxuICAgIHwgXCJuby1kcm9wXCJcbiAgICB8IFwibW92ZVwiXG4gICAgfCBcIm5vdC1hbGxvd2VkXCJcbiAgICB8IFwiZ3JhYlwiXG4gICAgfCBcImdyYWJiaW5nXCJcbiAgICB8IFwiYWxsLXNjcm9sbFwiXG4gICAgfCBcImNvbC1yZXNpemVcIlxuICAgIHwgXCJyb3ctcmVzaXplXCJcbiAgICB8IFwibi1yZXNpemVcIlxuICAgIHwgXCJlLXJlc2l6ZVwiXG4gICAgfCBcInMtcmVzaXplXCJcbiAgICB8IFwidy1yZXNpemVcIlxuICAgIHwgXCJuZS1yZXNpemVcIlxuICAgIHwgXCJudy1yZXNpemVcIlxuICAgIHwgXCJzdy1yZXNpemVcIlxuICAgIHwgXCJzZS1yZXNpemVcIlxuICAgIHwgXCJldy1yZXNpemVcIlxuICAgIHwgXCJucy1yZXNpemVcIlxuICAgIHwgXCJuZXN3LXJlc2l6ZVwiXG4gICAgfCBcIm53c2UtcmVzaXplXCJcbiAgICB8IFwiem9vbS1pblwiXG4gICAgfCBcInpvb20tb3V0XCJcblxudHlwZSBBY3Rpb25Hcm91cCA9IFtwcmVmaXg6IHN0cmluZywgYWN0aW9uR3JvdXA6IEdpby5BY3Rpb25Hcm91cF1cbiIsICJpbXBvcnQgR3RrIGZyb20gXCJnaTovL0d0az92ZXJzaW9uPTMuMFwiXG5pbXBvcnQgeyB0eXBlIEJpbmRhYmxlQ2hpbGQgfSBmcm9tIFwiLi9hc3RhbGlmeS5qc1wiXG5pbXBvcnQgeyBtZXJnZUJpbmRpbmdzLCBqc3ggYXMgX2pzeCB9IGZyb20gXCIuLi9fYXN0YWwuanNcIlxuaW1wb3J0ICogYXMgV2lkZ2V0IGZyb20gXCIuL3dpZGdldC5qc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBGcmFnbWVudCh7IGNoaWxkcmVuID0gW10sIGNoaWxkIH06IHtcbiAgICBjaGlsZD86IEJpbmRhYmxlQ2hpbGRcbiAgICBjaGlsZHJlbj86IEFycmF5PEJpbmRhYmxlQ2hpbGQ+XG59KSB7XG4gICAgaWYgKGNoaWxkKSBjaGlsZHJlbi5wdXNoKGNoaWxkKVxuICAgIHJldHVybiBtZXJnZUJpbmRpbmdzKGNoaWxkcmVuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24ganN4KFxuICAgIGN0b3I6IGtleW9mIHR5cGVvZiBjdG9ycyB8IHR5cGVvZiBHdGsuV2lkZ2V0LFxuICAgIHByb3BzOiBhbnksXG4pIHtcbiAgICByZXR1cm4gX2pzeChjdG9ycywgY3RvciBhcyBhbnksIHByb3BzKVxufVxuXG5jb25zdCBjdG9ycyA9IHtcbiAgICBib3g6IFdpZGdldC5Cb3gsXG4gICAgYnV0dG9uOiBXaWRnZXQuQnV0dG9uLFxuICAgIGNlbnRlcmJveDogV2lkZ2V0LkNlbnRlckJveCxcbiAgICBjaXJjdWxhcnByb2dyZXNzOiBXaWRnZXQuQ2lyY3VsYXJQcm9ncmVzcyxcbiAgICBkcmF3aW5nYXJlYTogV2lkZ2V0LkRyYXdpbmdBcmVhLFxuICAgIGVudHJ5OiBXaWRnZXQuRW50cnksXG4gICAgZXZlbnRib3g6IFdpZGdldC5FdmVudEJveCxcbiAgICAvLyBUT0RPOiBmaXhlZFxuICAgIC8vIFRPRE86IGZsb3dib3hcbiAgICBpY29uOiBXaWRnZXQuSWNvbixcbiAgICBsYWJlbDogV2lkZ2V0LkxhYmVsLFxuICAgIGxldmVsYmFyOiBXaWRnZXQuTGV2ZWxCYXIsXG4gICAgLy8gVE9ETzogbGlzdGJveFxuICAgIG1lbnVidXR0b246IFdpZGdldC5NZW51QnV0dG9uLFxuICAgIG92ZXJsYXk6IFdpZGdldC5PdmVybGF5LFxuICAgIHJldmVhbGVyOiBXaWRnZXQuUmV2ZWFsZXIsXG4gICAgc2Nyb2xsYWJsZTogV2lkZ2V0LlNjcm9sbGFibGUsXG4gICAgc2xpZGVyOiBXaWRnZXQuU2xpZGVyLFxuICAgIHN0YWNrOiBXaWRnZXQuU3RhY2ssXG4gICAgc3dpdGNoOiBXaWRnZXQuU3dpdGNoLFxuICAgIHdpbmRvdzogV2lkZ2V0LldpbmRvdyxcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbmFtZXNwYWNlXG4gICAgbmFtZXNwYWNlIEpTWCB7XG4gICAgICAgIHR5cGUgRWxlbWVudCA9IEd0ay5XaWRnZXRcbiAgICAgICAgdHlwZSBFbGVtZW50Q2xhc3MgPSBHdGsuV2lkZ2V0XG4gICAgICAgIGludGVyZmFjZSBJbnRyaW5zaWNFbGVtZW50cyB7XG4gICAgICAgICAgICBib3g6IFdpZGdldC5Cb3hQcm9wc1xuICAgICAgICAgICAgYnV0dG9uOiBXaWRnZXQuQnV0dG9uUHJvcHNcbiAgICAgICAgICAgIGNlbnRlcmJveDogV2lkZ2V0LkNlbnRlckJveFByb3BzXG4gICAgICAgICAgICBjaXJjdWxhcnByb2dyZXNzOiBXaWRnZXQuQ2lyY3VsYXJQcm9ncmVzc1Byb3BzXG4gICAgICAgICAgICBkcmF3aW5nYXJlYTogV2lkZ2V0LkRyYXdpbmdBcmVhUHJvcHNcbiAgICAgICAgICAgIGVudHJ5OiBXaWRnZXQuRW50cnlQcm9wc1xuICAgICAgICAgICAgZXZlbnRib3g6IFdpZGdldC5FdmVudEJveFByb3BzXG4gICAgICAgICAgICAvLyBUT0RPOiBmaXhlZFxuICAgICAgICAgICAgLy8gVE9ETzogZmxvd2JveFxuICAgICAgICAgICAgaWNvbjogV2lkZ2V0Lkljb25Qcm9wc1xuICAgICAgICAgICAgbGFiZWw6IFdpZGdldC5MYWJlbFByb3BzXG4gICAgICAgICAgICBsZXZlbGJhcjogV2lkZ2V0LkxldmVsQmFyUHJvcHNcbiAgICAgICAgICAgIC8vIFRPRE86IGxpc3Rib3hcbiAgICAgICAgICAgIG1lbnVidXR0b246IFdpZGdldC5NZW51QnV0dG9uUHJvcHNcbiAgICAgICAgICAgIG92ZXJsYXk6IFdpZGdldC5PdmVybGF5UHJvcHNcbiAgICAgICAgICAgIHJldmVhbGVyOiBXaWRnZXQuUmV2ZWFsZXJQcm9wc1xuICAgICAgICAgICAgc2Nyb2xsYWJsZTogV2lkZ2V0LlNjcm9sbGFibGVQcm9wc1xuICAgICAgICAgICAgc2xpZGVyOiBXaWRnZXQuU2xpZGVyUHJvcHNcbiAgICAgICAgICAgIHN0YWNrOiBXaWRnZXQuU3RhY2tQcm9wc1xuICAgICAgICAgICAgc3dpdGNoOiBXaWRnZXQuU3dpdGNoUHJvcHNcbiAgICAgICAgICAgIHdpbmRvdzogV2lkZ2V0LldpbmRvd1Byb3BzXG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBqc3hzID0ganN4XG4iLCAiaW1wb3J0IHsgQXBwLCBBc3RhbCwgR3RrLCB0eXBlIEdkayB9IGZyb20gXCJhc3RhbC9ndGs0XCI7XG5pbXBvcnQgeyBWYXJpYWJsZSB9IGZyb20gXCJhc3RhbFwiO1xuaW1wb3J0IHsgdCB9IGZyb20gXCIuLi9pMThuXCI7XG5cbmNvbnN0IHRpbWUgPSBWYXJpYWJsZShcIlwiKS5wb2xsKDEwMDAsIFwiZGF0ZVwiKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQmFyKGdka21vbml0b3I6IEdkay5Nb25pdG9yKTogUmV0dXJuVHlwZTx0eXBlb2YgQXN0YWwuV2luZG93PiB7XG4gIGNvbnN0IHsgVE9QLCBMRUZULCBSSUdIVCB9ID0gQXN0YWwuV2luZG93QW5jaG9yO1xuXG4gIHJldHVybiAoXG4gICAgPHdpbmRvd1xuICAgICAgdmlzaWJsZVxuICAgICAgY3NzQ2xhc3Nlcz17W1wiQmFyXCJdfVxuICAgICAgZ2RrbW9uaXRvcj17Z2RrbW9uaXRvcn1cbiAgICAgIGV4Y2x1c2l2aXR5PXtBc3RhbC5FeGNsdXNpdml0eS5FWENMVVNJVkV9XG4gICAgICBhbmNob3I9e1RPUCB8IExFRlQgfCBSSUdIVH1cbiAgICAgIGFwcGxpY2F0aW9uPXtBcHB9XG4gICAgPlxuICAgICAgPGNlbnRlcmJveCBjc3NOYW1lPVwiY2VudGVyYm94XCI+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrZWQ9XCJlY2hvIGhlbGxvXCJcbiAgICAgICAgICBoZXhwYW5kXG4gICAgICAgICAgaGFsaWduPXtHdGsuQWxpZ24uQ0VOVEVSfVxuICAgICAgICA+XG4gICAgICAgICAge3QoXCJ3ZWxjb21lXCIpfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJveCAvPlxuICAgICAgICA8bWVudWJ1dHRvblxuICAgICAgICAgIGhleHBhbmRcbiAgICAgICAgICBoYWxpZ249e0d0ay5BbGlnbi5DRU5URVJ9XG4gICAgICAgID5cbiAgICAgICAgICA8bGFiZWwgbGFiZWw9e3RpbWUoKX0gLz5cbiAgICAgICAgICA8cG9wb3Zlcj5cbiAgICAgICAgICAgIDxHdGsuQ2FsZW5kYXIgLz5cbiAgICAgICAgICA8L3BvcG92ZXI+XG4gICAgICAgIDwvbWVudWJ1dHRvbj5cbiAgICAgIDwvY2VudGVyYm94PlxuICAgIDwvd2luZG93PlxuICApO1xufVxuIiwgImltcG9ydCB7IEFwcCB9IGZyb20gXCJhc3RhbC9ndGs0XCI7XG5pbXBvcnQgc3R5bGUgZnJvbSBcIi4vc3R5bGUuc2Nzc1wiO1xuaW1wb3J0IEJhciBmcm9tIFwiLi93aWRnZXQvQmFyXCI7XG5cbnR5cGUgVE1vbml0b3IgPSBQYXJhbWV0ZXJzPHR5cGVvZiBCYXI+WzBdO1xuXG50eXBlIFRBcHBXaXRoTW9uaXRvcnMgPSB7XG4gIGdldF9tb25pdG9yczogKCkgPT4gVE1vbml0b3JbXTtcbiAgc3RhcnQ6IChjZmc6IHsgY3NzOiBzdHJpbmc7IG1haW46ICgpID0+IHZvaWQ7IH0pID0+IHZvaWQ7XG59O1xuXG4oQXBwIGFzIHVua25vd24gYXMgVEFwcFdpdGhNb25pdG9ycykuc3RhcnQoe1xuICBjc3M6IHN0eWxlLFxuICBtYWluKCkge1xuICAgIChBcHAgYXMgdW5rbm93biBhcyBUQXBwV2l0aE1vbml0b3JzKS5nZXRfbW9uaXRvcnMoKS5tYXAoQmFyKTtcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLE9BQU9BLFlBQVc7QUFDbEIsT0FBT0MsVUFBUztBQUNoQixPQUFPQyxVQUFTOzs7QUNGaEIsT0FBT0MsWUFBVzs7O0FDQWxCLE9BQU8sYUFBYTtBQUViLElBQU0sV0FBVyxDQUFDLFFBQWdCLElBQ3BDLFFBQVEsbUJBQW1CLE9BQU8sRUFDbEMsV0FBVyxLQUFLLEdBQUcsRUFDbkIsWUFBWTtBQUVWLElBQU0sV0FBVyxDQUFDLFFBQWdCLElBQ3BDLFFBQVEsbUJBQW1CLE9BQU8sRUFDbEMsV0FBVyxLQUFLLEdBQUcsRUFDbkIsWUFBWTtBQTZCVixJQUFNLFVBQU4sTUFBTSxTQUE4QztBQUFBLEVBQy9DLGNBQWMsQ0FBQyxNQUFXO0FBQUEsRUFFbEM7QUFBQSxFQUNBO0FBQUEsRUFlQSxPQUFPLEtBQUssU0FB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QUEsUUFDQSxnQkFBQUQsS0FBQyxTQUFJO0FBQUEsUUFDTDtBQUFBLFVBQUM7QUFBQTtBQUFBLFlBQ0MsU0FBTztBQUFBLFlBQ1AsUUFBUUMsS0FBSSxNQUFNO0FBQUEsWUFFbEI7QUFBQSw4QkFBQUQsS0FBQyxXQUFNLE9BQU8sS0FBSyxHQUFHO0FBQUEsY0FDdEIsZ0JBQUFBLEtBQUMsYUFDQywwQkFBQUEsS0FBQ0MsS0FBSSxVQUFKLEVBQWEsR0FDaEI7QUFBQTtBQUFBO0FBQUEsUUFDRjtBQUFBLFNBQ0Y7QUFBQTtBQUFBLEVBQ0Y7QUFFSjs7O0FDNUJDLFlBQW9DLE1BQU07QUFBQSxFQUN6QyxLQUFLO0FBQUEsRUFDTCxPQUFPO0FBQ0wsSUFBQyxZQUFvQyxhQUFhLEVBQUUsSUFBSSxHQUFHO0FBQUEsRUFDN0Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJBc3RhbCIsICJHdGsiLCAiR2RrIiwgIkFzdGFsIiwgImJpbmQiLCAiaW50ZXJ2YWwiLCAiQXN0YWwiLCAiQXN0YWwiLCAiQXN0YWwiLCAidiIsICJpbnRlcnZhbCIsICJjdG9ycyIsICJHdGsiLCAiQXN0YWwiLCAic25ha2VpZnkiLCAicGF0Y2giLCAiR09iamVjdCIsICJHdGsiLCAiQXN0YWwiLCAiQXN0YWwiLCAiR3RrIiwgIkd0ayIsICJBc3RhbCIsICJjaCIsICJkZWZhdWx0IiwgIkFzdGFsIiwgIkdPYmplY3QiLCAiZGVmYXVsdCIsICJHT2JqZWN0IiwgIkFzdGFsIiwgIkd0ayIsICJHT2JqZWN0IiwgIkFzdGFsIiwgIkd0ayIsICJHT2JqZWN0IiwgImFzdGFsaWZ5IiwgIkFzdGFsIiwgIkd0ayIsICJHT2JqZWN0IiwgImZpbHRlciIsICJHdGsiLCAiQXN0YWwiLCAiQm94IiwgImFzdGFsaWZ5IiwgIkdPYmplY3QiLCAiQnV0dG9uIiwgIkNlbnRlckJveCIsICJFbnRyeSIsICJMYWJlbCIsICJMZXZlbEJhciIsICJNZW51QnV0dG9uIiwgIk92ZXJsYXkiLCAiUmV2ZWFsZXIiLCAiU2xpZGVyIiwgIlN0YWNrIiwgIlN3aXRjaCIsICJXaW5kb3ciLCAianN4IiwgIkJveCIsICJCdXR0b24iLCAiQ2VudGVyQm94IiwgIkVudHJ5IiwgIkxhYmVsIiwgIkxldmVsQmFyIiwgIk1lbnVCdXR0b24iLCAiT3ZlcmxheSIsICJSZXZlYWxlciIsICJTbGlkZXIiLCAiU3RhY2siLCAiU3dpdGNoIiwgIldpbmRvdyIsICJBc3RhbCIsICJqc3giLCAiR3RrIl0KfQo=
