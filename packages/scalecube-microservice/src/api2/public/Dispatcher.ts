import { Observable } from 'rxjs6';
import Message from './Message';

export default interface Dispatcher {
  requestStream: (message: Message) => Observable<Message>;
  requestResponse: (message: Message) => Promise<Message>;
}
