import { Address } from '@scalecube/api';
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
  address?: Address;
  /**
   * @property
   * The data that the discovery need to share.
   */
  itemsToPublish: Item[];
  /**
   * @property
   * The unique address of the Cluster
   */
  seedAddress?: Address;
}
