import { ReplaySubject } from 'rxjs';
import { DiscoveryOptions, Discovery, Item } from '../api';
import { getCluster, joinCluster, leaveCluster } from './DiscoveryActions';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const'

export const createDiscovery = ({ address, itemsToPublish, seedAddress }: DiscoveryOptions): Discovery => {
  let cluster = getCluster({ seedAddress });
  const subjectNotifier = new ReplaySubject<Item[]>(1);

  cluster = joinCluster({ cluster, address, itemsToPublish, subjectNotifier });

  return Object.freeze({
    destroy: () => {
      cluster = leaveCluster({ cluster, address });
      subjectNotifier && subjectNotifier.complete();
      return Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(address, seedAddress));
    },
    discoveredItems$: () => subjectNotifier.asObservable(),
  });
};
