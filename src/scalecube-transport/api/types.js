// @flow

export interface TransportRequest {
  type: 'fireAndForget' | 'requestResponse' | 'requestStream' | 'requestChannel' | 'requestChannel';
  serviceName: string;
  actionName: string;
  data: any;
  responsesLimit?: number;
}

export interface TransportConfig {
  url: string;
  wsCreator: (url: string) => any;
  keepAlive?: number;
  lifetime?: number;
}
