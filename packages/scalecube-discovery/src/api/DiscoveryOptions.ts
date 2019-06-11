import { Api as TransportAPI } from '@scalecube/transport';
import { Item } from '.';

/**
 * @interface DiscoveryOptions
 * Options for discovery creation.
 */
export default interface DiscoveryOptions {
  /**
   * @property
   * A unique address of the Discovery.
   */
  address?: TransportAPI.Address;
  /**
   * @property
   * The data that the discovery need to share.
   */
  itemsToPublish: Item[];
  /**
   * @property
   * The unique address of the Cluster
   */
  seedAddress?: TransportAPI.Address;
}
