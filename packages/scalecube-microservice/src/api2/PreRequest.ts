import { Observable } from 'rxjs6';
import Message from './Message';

type PreRequest = (req$: Observable<Message>) => Observable<Message>;
export default PreRequest;
