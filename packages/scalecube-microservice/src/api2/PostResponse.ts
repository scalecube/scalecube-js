import { Observable } from 'rxjs6';
import Message from './Message';

type PostResponse = (res$: Observable<Message>) => Observable<Message>;
export default PostResponse;
