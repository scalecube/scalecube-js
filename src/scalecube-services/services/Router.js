// @flow
import { Message, ServiceInstance, ServiceRegistery } from 'src/scalecube-services/services';

export interface Router {
  route(message:Message): ServiceInstance | null;
}
