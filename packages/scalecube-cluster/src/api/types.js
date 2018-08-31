import { eventTypes, statuses } from '../helpers/const';

export type Status = statuses.success | statuses.fail;

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

