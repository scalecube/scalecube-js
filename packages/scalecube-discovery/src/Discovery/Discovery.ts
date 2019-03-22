import { ReplaySubject } from 'rxjs';
import { DiscoveryOptions, Discovery } from '../api';
import { getCluster, notifyAllListeners, removeFromCluster, addToCluster } from './DiscoveryActions';
import { Item } from '../helpers/types';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const'

export const createDiscovery = ({ nodeAddress, endPoints, seedAddress }: DiscoveryOptions): Discovery => {
  let cluster = getCluster({ seedAddress });
  const subjectNotifier = new ReplaySubject<Item[]>(1);

  cluster = addToCluster({ cluster, nodeAddress, endPoints, subjectNotifier });
  notifyAllListeners({ cluster });

  return Object.freeze({
    destroy: () => {
      cluster = removeFromCluster({ cluster, nodeAddress });
      notifyAllListeners({ cluster });
      subjectNotifier && subjectNotifier.complete();
      return Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(nodeAddress, seedAddress));
    },
    notifier: subjectNotifier.asObservable(),
  });
};
