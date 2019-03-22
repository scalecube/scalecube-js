import { Observable } from 'rxjs';
import { Item } from '.'

/**
 * Provides access to a Cluster, ability to add new Node with some entrypoints, subscribe to the changes of
 * entrypoints within the Cluster
 */
export default interface Discovery {
  /**
   * Removes Node from the Cluster, completes the notifier subscription and notifies other Nodes in the cluster
   * about the deleting of some entrypoints,
   * Resolves with the message, that specifies the address of the node and the address of the seed
   */
  destroy(): Promise<string>;
  /**
   * An Observable sequence that describes all the entrypoints of the Cluster (except the ones that were added
   * within the creation of Discovery).
   * Emits new data each time new entrypoint is added or removed from Cluster
   */
  notifier: Observable<Item[]>;
}
