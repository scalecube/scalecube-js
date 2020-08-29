type ListenerFn = (msg: any, port: MessagePort) => void;
export interface Listener extends ListenerFn {
  cleanFns?: Array<() => void>;
}
type remove = () => void;
export type listen = (addr: string, fn: Listener) => remove;
export type connect = (addr: string, timeout?: number) => Promise<MessagePort>;
