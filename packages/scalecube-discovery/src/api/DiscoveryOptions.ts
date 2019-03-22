import { Item } from '.'

/**
 * The parameters that are required to add Node to the Cluster
 */
export default interface DiscoveryOptions {
  /**
   * The unique address of the Node that should be added to the Cluster
   */
  address: string;
  /**
   * Endpoints that should be added to the Cluster
   */
  endPoints: Item[];
  /**
   * The unique address of the Cluster
   */
  seedAddress: string;
}
