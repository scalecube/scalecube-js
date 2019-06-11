import { ReplaySubject } from 'rxjs';
import { DiscoveryOptions, Discovery, Item, CreateDiscovery } from '../api';
import { getCluster, joinCluster, leaveCluster } from './DiscoveryActions';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const';

export const createDiscovery: CreateDiscovery = ({
  address,
  itemsToPublish,
  seedAddress,
}: DiscoveryOptions): Discovery => {
  if (!seedAddress) {
    seedAddress = {
      host: '',
      port: 8080,
      path: '',
      protocol: 'pm',
      fullAddress: 'defaultSeedAddress',
    };
  }

  let cluster = getCluster({ seedAddress });
  const subjectNotifier = new ReplaySubject<Item[]>(1);

  if (address) {
    cluster = joinCluster({ cluster, address, itemsToPublish, subjectNotifier });
  }

  return Object.freeze({
    destroy: () => {
      if (address && seedAddress) {
        cluster = leaveCluster({ cluster, address });
        subjectNotifier && subjectNotifier.complete();
        return Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(address, seedAddress));
      } else {
        return Promise.resolve('');
      }
    },
    discoveredItems$: () => subjectNotifier.asObservable(),
  });
};
