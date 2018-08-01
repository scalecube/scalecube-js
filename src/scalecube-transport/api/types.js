// @flow

export interface TransportRequest {
  headers: Object;
  entrypoint: string;
  data: any;
}

export interface ProviderConfig {
  URI: string;
  keepAlive?: number;
  keepAlive?: number;
  lifetime?: number;
  WebSocket?: any;
}
