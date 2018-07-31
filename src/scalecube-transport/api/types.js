// @flow
export interface TransportRequest {
  type: 'fireAndForget' | 'requestResponse' | 'requestStream' | 'requestChannel' | 'requestChannel';
  serviceName: string;
  actionName: string;
  data: any;
  responsesLimit?: number;
}
