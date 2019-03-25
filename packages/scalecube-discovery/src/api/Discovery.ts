import { Observable } from 'rxjs';
import { Item } from '.'

/**
 * @interface Discovery
 * Provides a way to publish and discover items in distributed environment
 */
export default interface Discovery {
  /**
   * An Observable sequence that describes all the items that published by **other** discoveries.
   * Emits new array of all items each time new discovery is created or destroyed.
   */
  discoveredItems$(): Observable<Item[]>;
  /**
   * Destroy the discovery:
   * - Completes discoveredItems$.
   * - Notifies other discoveries that this discovery's items are not available anymore.
   * - Resolves with the message, that specifies the address of the node and the address of the seed
   */
  destroy(): Promise<string>;
}
