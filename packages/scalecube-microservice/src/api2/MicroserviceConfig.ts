import { Observable } from 'rxjs6';
import { Message } from '../api/Message';

export default interface MicroserviceConfig {
  services?: any[];
  lazyServices?: any[];
  preRequest?: (req$: Observable<Message>) => any;
  postResponse?: (res$: Observable<Message>) => any;
}
