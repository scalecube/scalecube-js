import Message from './Message';
import ServiceCallResponse from './ServiceCallResponse';

export default interface Dispatcher {
  listen: (message: Message) => ServiceCallResponse;
  invoke: (message: Message) => ServiceCallResponse;
}
