import { Item } from '.'

/**
 * Options for discovery creation.
 */
export default interface DiscoveryOptions {
  /**
   * A unique address of the Discovery.
   */
  address: string;
  /**
   * The data that the discovery need to share.
   */
  itemsToPublish: Item[];
  /**
   * The unique address of the Cluster
   */
  seedAddress: string;
}
