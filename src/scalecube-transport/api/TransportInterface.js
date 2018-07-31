// @flow
import { TransportRequest, TransportConfig } from './types';
import { Observable } from 'rxjs';

export interface TransportInterface {
  constructor(transportConfig: TransportConfig) : void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request(transportRequest: TransportRequest): Observable<any>;
}
