import { eventTypes } from '../helpers/const';

export interface Request {
  path: string,
  args?: any
}

export interface Message {
  eventType: eventTypes.message | eventTypes.requestResponse,
  correlationId: string,
  clusterId: string,
  request?: Request,
  response?: any
}
