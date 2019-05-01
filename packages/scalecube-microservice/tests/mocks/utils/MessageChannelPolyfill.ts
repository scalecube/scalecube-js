interface IMessagePortPolyfill {
  dispatchEvent: (event: { data: any }) => boolean;
  postMessage: (message: any) => void;
  addEventListener: (type: string, listener: any) => void;
  removeEventListener: (type: string, listener: any) => void;
  start: () => void;
  close: () => void;
  startSending: () => void;
  stopSending: () => void;
  otherPort: IMessagePortPolyfill | null;
}

interface IMessageChannelPolyfill {
  port1: IMessagePortPolyfill;
  port2: IMessagePortPolyfill;
}

// polyfill MessagePort and MessageChannel
export class MessagePortPolyfill implements IMessagePortPolyfill {
  public otherPort: IMessagePortPolyfill | null;

  private onmessage: any;
  private onmessageerror: any;
  private onmessageListeners: any[];
  private queue: any[];
  private otherSideStart: boolean;
  private whoami: string;

  constructor(whoami: string) {
    this.onmessage = null;
    this.onmessageerror = null;
    this.otherPort = null;
    this.onmessageListeners = [];
    this.queue = [];
    this.otherSideStart = false;
    this.whoami = whoami;
  }

  public dispatchEvent(event: { data: any }) {
    if (this.onmessage) {
      this.onmessage(event);
    }
    this.onmessageListeners.forEach((listener) => listener(event));

    return true;
  }

  public postMessage(message: string) {
    if (!this.otherPort) {
      return;
    }
    if (this.otherSideStart) {
      this.otherPort.dispatchEvent({ data: message });
    } else {
      this.queue.push(message);
    }
  }

  public addEventListener(type: string, listener: any) {
    if (type !== 'message') {
      return;
    }
    if (typeof listener !== 'function' || this.onmessageListeners.indexOf(listener) !== -1) {
      return;
    }
    this.onmessageListeners.push(listener);
  }

  public removeEventListener(type: string, listener: any) {
    if (type !== 'message') {
      return;
    }
    const index = this.onmessageListeners.indexOf(listener);
    if (index === -1) {
      return;
    }
    this.onmessageListeners.splice(index, 1);
  }

  public start() {
    setTimeout(() => this.otherPort && this.otherPort.startSending.apply(this.otherPort, []), 0);
  }

  public close() {
    setTimeout(() => this.otherPort && this.otherPort.stopSending.apply(this.otherPort, []), 0);
  }

  public startSending() {
    this.otherSideStart = true;
    this.queue.forEach((message: any) => this.otherPort && this.otherPort.dispatchEvent({ data: message }));
  }

  public stopSending() {
    this.otherSideStart = false;
    this.queue.length = 0;
  }
}

// tslint:disable-next-line
export class MessageChannelPolyfill implements IMessageChannelPolyfill {
  public port1: IMessagePortPolyfill;
  public port2: IMessagePortPolyfill;

  constructor() {
    this.port1 = new MessagePortPolyfill('client');
    this.port2 = new MessagePortPolyfill('server');
    this.port1.otherPort = this.port2;
    this.port2.otherPort = this.port1;
  }
}

// @ts-ignore
/**
 * https://github.com/zloirock/core-js/blob/master/packages/core-js/internals/global.js
 */

declare global {
  interface Window {
    Math: any;
  }
}

const globalObj =
  typeof window !== 'undefined' && window.Math === Math
    ? window
    : typeof self !== 'undefined' && self.Math === Math
    ? self
    : Function('return this')();

export function applyMessageChannelPolyfill() {
  globalObj.MessagePort = MessagePortPolyfill;
  globalObj.MessageChannel = MessageChannelPolyfill;
}

if (!globalObj.MessagePort || !globalObj.MessageChannel) {
  applyMessageChannelPolyfill();
}
