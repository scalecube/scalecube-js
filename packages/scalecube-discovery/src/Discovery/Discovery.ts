import { ReplaySubject } from 'rxjs';
import { DiscoveryOptions, Discovery } from '../api';
import { getCluster, notifyAllListeners, removeFromCluster, addToCluster } from './DiscoveryActions';
import { Item } from '../helpers/types';

export const createDiscovery = ({ address, endPoints, seedAddress }: DiscoveryOptions): Discovery => {
  let cluster = getCluster({ seedAddress });
  const subjectNotifier = new ReplaySubject<Item[]>(1);

  cluster = addToCluster({ cluster, address, endPoints, subjectNotifier });
  notifyAllListeners({ cluster });

  return Object.freeze({
    destroy: () => {
      cluster = removeFromCluster({ cluster, address });
      notifyAllListeners({ cluster });
      subjectNotifier && subjectNotifier.complete();
      return Promise.resolve(`${address} as been removed from ${seedAddress}`);
    },
    notifier: subjectNotifier.asObservable(),
  });
};
