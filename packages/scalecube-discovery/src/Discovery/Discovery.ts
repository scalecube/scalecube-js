import { ReplaySubject } from 'rxjs';
import { getFullAddress } from '@scalecube/utils';
import { Address } from '@scalecube/api';
import { DiscoveryOptions, Discovery, Item, CreateDiscovery } from '../api';
import { getCluster, joinCluster, leaveCluster } from './DiscoveryActions';
import { getAddressCollision, getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const';

export const createDiscovery: CreateDiscovery = ({
  address,
  itemsToPublish,
  seedAddress,
}: DiscoveryOptions): Discovery => {
  if (!seedAddress) {
    seedAddress = {
      host: 'defaultSeedAddress',
      port: 8080,
      path: 'path',
      protocol: 'pm',
    };
  }

  if (!address) {
    address = {
      host: 'defaultAddress',
      port: 8000,
      path: 'path',
      protocol: 'pm',
    };
  }

  validateAddressCollision(address, seedAddress);

  let cluster = getCluster({ seedAddress });
  const subjectNotifier = new ReplaySubject<Item[]>(1);

  cluster = joinCluster({ cluster, address, itemsToPublish, subjectNotifier });

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

const validateAddressCollision = (addressPort: Address, seedAddressPort: Address) => {
  if (getFullAddress(addressPort) === getFullAddress(seedAddressPort)) {
    throw new Error(getAddressCollision(addressPort, seedAddressPort));
  }
};
