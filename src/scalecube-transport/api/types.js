// @flow

export interface TransportRequestHeaders {
  [key:string]: string | number;
}

export interface TransportRequest {
  headers: TransportRequestHeaders;
  entrypoint: string;
  data: any;
}

export interface ProviderConfig {
  url: string;
}
