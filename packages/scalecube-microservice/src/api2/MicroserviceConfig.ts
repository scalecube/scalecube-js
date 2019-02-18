import { Observable } from 'rxjs6';
import Message from '../api2/Message';
import Service from './Service';
import LazyService from './LazyService';

export default interface MicroserviceConfig {
  services?: Service[];
  lazyServices?: LazyService[];
  preRequest?: (req$: Observable<Message>) => Observable<Message>;
  postResponse?: (res$: Observable<Message>) => Observable<Message>;
}
