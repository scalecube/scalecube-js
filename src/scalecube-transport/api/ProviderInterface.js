// @flow
import { TransportRequest, ProviderConfig } from './types';
import { Observable } from 'rxjs';

export interface ProviderInterface {
  build(providerConfig:ProviderConfig): Promise<void>;
  request(transportRequest:TransportRequest): Observable<any>;
  destroy(): Promise<void>;
}
