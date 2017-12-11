// @flow
import { Message, ServiceInstance } from 'src/scalecube-services';

export interface Router {
  route(message:Message): ServiceInstance | null;
}
