import { Item } from '../helpers/types';

/**
 * DiscoveryOptions - The parameters that are required to add Node to the Cluster
 *
 * @param address - Microservice unique address.
 *
 * @param endPoints - Endpoints to share in the Cluster.
 *
 * @param seedAddress - address of the Cluster seed.
 *
 */
export default interface DiscoveryOptions {
  address: string;
  endPoints: Item[];
  seedAddress: string;
}
