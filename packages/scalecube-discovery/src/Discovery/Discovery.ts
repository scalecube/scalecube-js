import { getFullAddress, validateAddress, check } from '@scalecube/utils';
import { Address, DiscoveryApi, ClusterApi } from '@scalecube/api';
import { joinCluster } from '@scalecube/cluster-browser';
import {
  getAddressCollision,
  getDiscoverySuccessfullyDestroyedMessage,
  INVALID_ITEMS_TO_PUBLISH,
} from '../helpers/constants';
import { ReplaySubject } from 'rxjs';

export const createDiscovery: DiscoveryApi.CreateDiscovery = ({
  address,
  itemsToPublish,
  seedAddress,
  debug,
}: DiscoveryApi.DiscoveryOptions): DiscoveryApi.Discovery => {
  const membersState: { [member: string]: boolean } = {};

  validateAddress(address, false);

  if (seedAddress) {
    validateAddress(seedAddress, false);
    validateAddressCollision(address, seedAddress);
  }

  check.assertArray(itemsToPublish, INVALID_ITEMS_TO_PUBLISH);

  const discoveredItemsSubject = new ReplaySubject<DiscoveryApi.ServiceDiscoveryEvent>();

  const cluster: ClusterApi.Cluster = joinCluster({ address, seedAddress, itemsToPublish, transport: null, debug });

  const clusterListener = cluster.listen$();
  let subscription: any;

  return Object.freeze({
    destroy: () => {
      subscription && subscription.unsubscribe();
      discoveredItemsSubject.complete();
      return new Promise<string>((resolve, reject) => {
        cluster
          .destroy()
          .then(() => resolve(getDiscoverySuccessfullyDestroyedMessage(address)))
          .catch((error: any) => reject(error));
      });
    },
    discoveredItems$: () => {
      cluster
        .getCurrentMemberStates()
        .then((currentMembersState: ClusterApi.MembersData) => {
          const members = Object.keys(currentMembersState);
          members.forEach((member: string) => {
            const memberItem = currentMembersState[member];

            if (memberItem.length === 0) {
              discoveredItemsSubject.next({
                type: 'IDLE',
                items: [],
              });
            } else {
              if (!membersState[member]) {
                membersState[member] = true;
                discoveredItemsSubject.next({
                  type: 'REGISTERED',
                  items: memberItem,
                });
              }
            }
          });
        })
        .catch((error: any) => discoveredItemsSubject.error(error));

      subscription = clusterListener.subscribe(
        (clusterEvent: ClusterApi.ClusterEvent) => {
          const { type, items, from } = clusterEvent;
          if (items.length > 0) {
            if (type === 'REMOVED' && membersState[from]) {
              membersState[from] = false;
              discoveredItemsSubject.next({
                type: 'UNREGISTERED',
                items,
              });
            }

            if (type !== 'REMOVED' && !membersState[from]) {
              membersState[from] = true;
              discoveredItemsSubject.next({
                type: 'REGISTERED',
                items,
              });
            }
          } else {
            if (type === 'INIT') {
              discoveredItemsSubject.next({
                type: 'IDLE',
                items: [],
              });
            }
          }
        },
        (error: any) => discoveredItemsSubject.error(error),
        () => discoveredItemsSubject.complete()
      );

      return discoveredItemsSubject.asObservable();
    },
  });
};

const validateAddressCollision = (address: Address, seedAddress: Address) => {
  const fullAddress = getFullAddress(address);
  const fullSeedAddress = getFullAddress(seedAddress);
  if (fullAddress === fullSeedAddress) {
    throw new Error(getAddressCollision(fullAddress, fullSeedAddress));
  }
};
