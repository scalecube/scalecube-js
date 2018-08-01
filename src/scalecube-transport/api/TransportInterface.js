// @flow
import { TransportRequest, ProviderConfig } from './types';
import { ProviderInterface } from './ProviderInterface';
import { Observable } from 'rxjs';

export interface TransportInterface {
  setProvider(Provider: ProviderInterface, providerConfig: ProviderConfig): Promise<void>;
  request(transportRequest: TransportRequest): Observable<any>;
}
