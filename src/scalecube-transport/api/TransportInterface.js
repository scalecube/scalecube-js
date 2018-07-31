// @flow
import { TransportRequest, TransportConstructor } from './types';
import { Observable } from 'rxjs';

export interface TransportInterface {
  constructor(transportConstructor: TransportConstructor) : void
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  request(transportRequest: TransportRequest): Observable<any>;
}
