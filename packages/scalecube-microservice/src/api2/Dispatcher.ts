import { Observable } from 'rxjs6';
import Message from './Message';
import ServiceCallResponse from './ServiceCallResponse';

// be sync with scalecube

// listen - obs
// invoke - promise

export default interface Dispatcher {
  requestStream: (message: Message) => Observable<Message>;
  requestResponse: (message: Message) => Promise<Message>;
}
