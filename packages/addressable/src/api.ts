export type Listener = (msg: any, port: MessagePort) => void;
export type listen = (addr: string, fn: Listener) => void;
export type connect = (addr: string, timeout?: number) => Promise<MessagePort>;
