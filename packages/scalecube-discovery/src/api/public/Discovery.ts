import { DiscoveryConnect, DiscoveryCreate } from './index';

export default interface Discovery {
  create: (data: DiscoveryConnect) => DiscoveryCreate;
}
