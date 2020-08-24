import { connect, listen } from '@scalecube/addressable';
import { Observable } from 'rxjs';
import { ClusterEvent } from '@scalecube/api/lib/cluster';

export function createServer(address: string) {
  return new Observable<ClusterEvent & { sender?: any; send: any; on: any }>((obs) => {
    listen(address, (msg: { data: ClusterEvent }, port) => {
      obs.next({
        ...msg.data,
        send: (m: any) => port.postMessage(m),
        on: (cond: (ev: any) => boolean, handler: (m: any) => void) => {
          port.addEventListener('message', (e) => {
            if (cond(e.data)) {
              handler(e.data);
            }
          });
        },
      });
    });
  });
}

export function createConnection() {
  const connections: { [address: string]: MessagePort } = {};

  function getConnection(address: string) {
    connections[address] = connections[address] || connect(address);
    return connections[address];
  }
  async function send(address: string, msg: any) {
    const con = await getConnection(address);
    con.postMessage(msg);
  }
  async function on(address: string, listener: (e: any) => void) {
    const con = await getConnection(address);
    con.addEventListener('message', (e) => listener(e.data));
  }

  return { send, on };
}
