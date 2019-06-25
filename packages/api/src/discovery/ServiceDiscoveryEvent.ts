import { Item } from '.';

export default interface ServiceDiscoveryEvent {
  type: 'REGISTERED' | 'UNREGISTERED';
  items: Item[];
}
