import { Observable } from 'rxjs';
import { Item, ServiceDiscoveryEvent } from '.';
import { Address } from '../common';

/**
 * @interface CreateDiscovery
 * factory for creating discovery instance
 */
export type CreateDiscovery = (options: DiscoveryOptions) => Discovery;

/**
 * @interface DiscoveryOptions
 * Options for discovery creation.
 */
export interface DiscoveryOptions {
  /**
   * @property
   * A unique address.
   * used for connection between discoveries.
   */
  address: Address;
  /**
   * @property
   * The data that the discovery need to share.
   */
  itemsToPublish: Item[];
  /**
   * @property
   * the address we want to use in-order to connect to the distributed environment.
   */
  seedAddress?: Address;

  /**
   * @property
   * enable discovery console.logs
   */
  debug?: boolean;
  /**
   * @property
   * register discovery logs under namespace
   * window[namespace]
   */
  logger?: {
    namespace: string;
  };
}

/**
 * @interface Discovery
 * Provides a way to publish and discover items in distributed environment
 */
export interface Discovery {
  /**
   * @method
   * An Observable sequence that describes all the items that published by **other** discoveries.
   * Emits new array of all items each time new discovery is created or destroyed.
   */
  discoveredItems$: () => Observable<ServiceDiscoveryEvent>;

  /**
   * @method
   * Destroy the discovery:
   * - Completes discoveredItems$.
   * - Notifies other discoveries that this discovery's items are not available anymore.
   * - Resolves with the message, that specifies the address of the discovery
   */
  destroy(): Promise<string>;
}
