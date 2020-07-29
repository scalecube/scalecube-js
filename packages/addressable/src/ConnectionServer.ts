import { Subject } from './utils/Subject';
import { join } from './utils/join';
import { Node } from './Node';
import { DEBUG, EVENT } from './const';
import { Peer } from './types';

export function createConnectionServer() {
  const peer = new Node();
  const addresses: { [address: string]: string } = {};
  const address$ = new Subject();
  // tslint:disable-next-line:no-console
  const debug = DEBUG ? (...args: any[]) => console.log('debug', peer.id, ...args) : () => {};

  function handleRegisterAddress(e: any) {
    if (e.data.type === EVENT.registerAddress && e.data.address && e.data.peerId) {
      debug('register address', e.data.address);
      addresses[e.data.address] = e.data.peerId;
      address$.next({
        address: e.data.address,
        peerId: e.data.peerId,
      });
    }
    return false;
  }
  function handleConnect(e: any) {
    if (e.data.type === EVENT.connect && e.data.sourceNodeId && e.data.remoteAddress) {
      join(address$, peer).subscribe(() => {
        const peers = peer.get();
        if (peers[e.data.sourceNodeId] && addresses[e.data.remoteAddress]) {
          debug(EVENT.connect, e.data.remoteAddress, e.data.sourceNodeId);
          const ch = new MessageChannel();
          const ev = {
            remoteAddress: e.data.remoteAddress,
            connectionId: e.data.connectionId,
            sourceNodeId: e.data.sourceNodeId,
          };
          peers[e.data.sourceNodeId].postMessage({ ...ev, type: 'incomingClientConnection' }, [ch.port2]);
          peers[addresses[e.data.remoteAddress]].postMessage({ ...ev, type: EVENT.incomingServerConnection }, [
            ch.port1,
          ]);
        }
      });
    }
    return false;
  }
  function eventHandler(e: any) {
    if (e && e.data) {
      handleConnect(e) || handleRegisterAddress(e);
    }
  }

  const unsubscribe = peer.subscribe(({ port }: Peer) => {
    debug('peer added');
    port.addEventListener('message', eventHandler);
  });

  return {
    /**
     * @method channelHandler
     * Handle incoming channels
     *
     * @param e event
     */
    channelHandler: (e: any) => {
      if (e.data.type === EVENT.addChannel) {
        peer.add(e.data.nodeId, e.ports[0]);
        e.ports[0].start();
        e.ports[0].postMessage({
          type: EVENT.channelInit,
          nodeId: e.data.nodeId,
        });
      }
    },
    shutdown: () => {
      unsubscribe();
      const peers = peer.get();
      for (const id in peers) {
        peers[id].removeEventListener('message', eventHandler);
      }
    },
  };
}
