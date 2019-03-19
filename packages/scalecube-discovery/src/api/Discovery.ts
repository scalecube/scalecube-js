import { Observable } from 'rxjs';
import { Item } from '../helpers/types';

/**
 * Discovery provide functionality to receive/send information about nodes in the cluster
 * and to remove Node from the Cluster.
 *
 * `destroy: Promise<string>` - remove Microservice Node from the Cluster
 *
 * `notifier: Observable<Endpoint[]>` - notify on endpoints in the Cluster
 *
 */
export default interface Discovery {
  destroy: () => Promise<string>;
  notifier: Observable<Item[]>;
}
