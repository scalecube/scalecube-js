import { Item } from '../helpers/types';

export default interface DiscoveryOptions {
  address: string;
  endPoints: Item[];
  seedAddress: string;
}
