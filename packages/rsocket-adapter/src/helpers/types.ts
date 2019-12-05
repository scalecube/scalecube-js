// @ts-ignore
import { ReactiveSocket } from 'rsocket-types';

export type CreateConnectionManager = () => ConnectionManager;

export interface ConnectionManager {
  getConnection: (connectionAddress: string) => Promise<ReactiveSocket>;
  getAllConnections: () => { [key: string]: Promise<ReactiveSocket> };
  setConnection: (connectionAddress: string, value: Promise<ReactiveSocket>) => void;
  removeConnection: (connectionAddress: string) => void;
}

export interface RsocketEventsPayload {
  data: any;
  metadata: any;
}
