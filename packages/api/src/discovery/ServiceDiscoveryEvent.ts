import { Item } from '.';

export interface ServiceDiscoveryEvent {
  type: Type;
  items: Item[];
}

export type Type = 'REGISTERED' | 'UNREGISTERED' | 'IDLE';
