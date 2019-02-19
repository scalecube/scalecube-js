import { Observable } from 'rxjs6';
import { Message } from '../public';

type ServiceCallResponse = Observable<Message> | Promise<Message>;
export default ServiceCallResponse;
