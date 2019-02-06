import { Message } from './Message';

export interface ABTestingRequest {
  a: string;
  b: string;
}

export interface RouteRequest {
  request: Message;
  serviceRegistry: object;
}
