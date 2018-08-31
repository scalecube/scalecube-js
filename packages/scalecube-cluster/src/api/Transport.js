import { Subject } from 'rxjs6';
import { TransportConfig } from './TransportConfig';
import { Request } from './types';

export interface Transport {
  constructor(transportConfig: TransportConfig, messages$: Subject): void;

  invoke(request: Request): Promise<any>;
}
