import { Observable } from 'rxjs';
import { Message } from './public';

export default interface ServiceCall {
  requestStream: (message: Message) => Observable<Message>;
  requestResponse: (message: Message) => Promise<Message>;
}
