import { Observable } from 'rxjs6';
import { Message } from '.';

export default interface ServiceCall {
  requestStream: (message: Message) => Observable<Message>;
  requestResponse: (message: Message) => Promise<Message>;
}
