import { Observable } from 'rxjs6';
import Message from './Message';

export default interface CreateDispatcherRequest {
  router: any;
  serviceRegistry: any;
  preRequest: (req$: Observable<Message>) => any;
  postResponse: (req$: Observable<Message>) => any;
}
