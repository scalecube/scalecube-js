// @flow
import { TransportRequest } from './types';
import { Observable } from 'rxjs';

export interface TransportInterface {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request(transportRequest: TransportRequest): Observable<any>;
}
