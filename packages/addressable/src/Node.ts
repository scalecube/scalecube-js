import { Subject } from './utils/Subject';
import { eachUnique } from './utils/eachUnique';
import { map } from './utils/map';
import { Peer } from './types';

/**
 * @class Node
 * Node represents current Node and holds all "peers" (channel to other Nodes)
 */
export class Node {
  /**
   * @property id
   * Node id
   */
  public readonly id = `${Math.random().toString()}-${Math.random().toString()}-${Math.random().toString()}-${Math.random().toString()}`;
  private peers: { [id: string]: MessagePort } = {};
  private peers$ = new Subject();

  /**
   * @method Subscribe
   * Notify each time new peer register in node
   * It's also send all peers joined before subscription started
   * @param fn notification handler
   */
  public subscribe(fn: (peer: Peer) => void): () => void {
    // Peers act like unique reply subject
    return map((o: Peer) => ({ id: o.key, port: o.value }), eachUnique(this.peers$)).subscribe(fn);
  }
  /**
   * @Method get
   * Get all peers
   */
  public get() {
    return { ...this.peers };
  }

  /**
   * @method add
   * Add new new peer to node
   *
   * @param id
   * @param port
   */
  public add(id: string, port: MessagePort) {
    this.peers[id] = port;
    this.peers$.next(this.peers);
  }
  /**
   * @method remove
   * Remove peer from node
   *
   * @param id
   */
  public remove(id: string) {
    delete this.peers[id];
    this.peers$.next(this.peers);
  }
}
