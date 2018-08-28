import { Subject } from 'rxjs/Subject';
import { TransportConfig } from './TransportConfig';
import { Request } from './types';

export interface Transport {
  constructor(transportConfig: TransportConfig, messages$: Subject): void;

  invoke(request: Request): Promise<any>;
}
