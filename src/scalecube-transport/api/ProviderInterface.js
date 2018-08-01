// @flow
import { TransportRequest, ProviderConfig } from './types';
import { Observable } from 'rxjs';

export interface TransportInterface {
  build(config: ProviderConfig): Promise<void>;
  request(transportRequest: TransportRequest): Observable<any>;
}
