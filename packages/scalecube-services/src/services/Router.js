// @flow
import { Message, ServiceInstance } from ".";

export interface Router {
  route(message: Message): ServiceInstance | null
}
