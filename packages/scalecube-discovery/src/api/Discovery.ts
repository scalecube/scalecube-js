import { Observable } from 'rxjs';
import { Item } from '../helpers/types';

export default interface Discovery {
  destroy: () => Promise<string>;
  notifier: Observable<Item[]>;
}
