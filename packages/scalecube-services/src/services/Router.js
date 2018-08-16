// @flow
import { Message, ServiceInstance, ServiceRegistery } from '.';

export interface Router {
  route(message:Message): ServiceInstance | null;
}
