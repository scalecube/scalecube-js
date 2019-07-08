import { Item } from '.';

export default interface ServiceDiscoveryEvent {
  type: 'REGISTERED' | 'UNREGISTERED' | 'IDLE';
  items: Item[];
}
