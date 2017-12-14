// @flow
import { Message, ServiceInstance } from 'src/scalecube-services/services';

export interface Router {
  route(message:Message): ServiceInstance | null;
}
