import * as api from './api';
import { Node } from './Node';
import { DEBUG, EVENT } from './const';

export function createConnectionClient(): { listen: api.listen; connect: api.connect; [key: string]: any } {
  const peer = new Node();
  const listeners: { [address: string]: api.Listener } = {};
  // tslint:disable-next-line:no-console
  const debug = DEBUG ? (...args: any[]) => console.log('debug', peer.id, ...args) : () => {};

  peer.subscribe(({ port }) => {
    debug('client peer added');
    port.addEventListener('message', (e) => {
      if (e && e.data) {
        if (
          e.data.type === EVENT.incomingServerConnection &&
          e.data.remoteAddress &&
          listeners[e.data.remoteAddress] &&
          e.ports[0]
        ) {
          debug('incoming server connection');
          e.ports[0].addEventListener('message', (msg) => {
            debug('invoke', e.data.remoteAddress);
            listeners[e.data.remoteAddress](msg, e.ports[0]);
          });
          e.ports[0].start();
        }
      }
    });
  });

  return {
    createChannel: (pm: (msg: any, ports: MessagePort[]) => void, timeout: number = 5000): Promise<any> => {
      const endTime = Date.now() + timeout;
      return new Promise((resolve, reject) => {
        const tryCreate = () => {
          const ch = new MessageChannel();
          const to = setTimeout(() => {
            ch.port1.close();
            ch.port2.close();
            if (Date.now() < endTime) {
              tryCreate();
            } else {
              reject();
            }
          }, 100);
          pm(
            {
              type: EVENT.addChannel,
              nodeId: peer.id,
            },
            [ch.port1]
          );
          ch.port2.addEventListener('message', (e) => {
            if (e.data.type === EVENT.channelInit) {
              debug('connection init');
              peer.add(e.data.nodeId, ch.port2);
              clearTimeout(to);
              resolve();
            }
          });
          ch.port2.start();
        };
        tryCreate();
      });
    },
    listen: (addr: string, fn: api.Listener) => {
      listeners[addr] = fn;
      peer.subscribe(({ port }) => {
        port.postMessage({ type: EVENT.registerAddress, peerId: peer.id, address: addr });
      });
    },
    connect: (addr: string, to = 5000): Promise<MessagePort> => {
      return new Promise((resolve, reject) => {
        const conn = {
          remoteAddress: addr,
          sourceNodeId: peer.id,
          connectionId: `${Date.now()}-${Math.random()}`,
        };
        const clearEvents = () => {
          const peers = peer.get();
          for (const key in peers) {
            peers[key].removeEventListener('message', incomingConn);
          }
        };
        const timeout = setTimeout(() => {
          unsubscribe();
          clearEvents();
          reject('connection timeout');
        }, to);
        const incomingConn = (e: any) => {
          debug('incoming conn');
          if (e && e.data && e.data.connectionId === conn.connectionId && e.ports[0]) {
            debug('connection resolved');
            clearEvents();
            clearTimeout(timeout);
            e.ports[0].start();
            const port = new Proxy(e.ports[0], {
              get: (target, prop) => {
                if (prop === 'close') {
                  return () => {
                    target.postMessage('closeConnection');
                    target.close();
                  };
                }
                return target[prop];
              },
            });
            //     {
            //   postMessage: (msg: any, ports: MessagePort[]) => e.ports[0].postMessage(msg, ports),
            //   addEventListener: (name: string, event: any) => e.ports[0].addEventListener(name, event);
            //   close:
            // }
            resolve(port);
          }
        };
        const unsubscribe = peer.subscribe(({ id, port }) => {
          debug(id, 'send connect');
          port.addEventListener('message', incomingConn);
          port.postMessage({ ...conn, type: EVENT.connect }, []);
        });
      });
    },
  };
}
