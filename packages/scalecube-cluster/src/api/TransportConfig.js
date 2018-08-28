export type TransportType = 'PostMessage';

export interface TransportConfig {
  type: TransportType,
  worker: any,
  me: any,
  clusterId: string
}