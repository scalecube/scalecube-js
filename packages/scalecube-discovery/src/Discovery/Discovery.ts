import { getFullAddress, getAddress, validateAddress, check } from '@scalecube/utils';
import { Address, DiscoveryApi } from '@scalecube/api';
import { ClusterEvent, joinCluster } from './Cluster/JoinCluster';
import {
  ADDRESS_DESTROYED,
  getAddressCollision,
  getDiscoverySuccessfullyDestroyedMessage,
  INVALID_ITEMS_TO_PUBLISH,
} from '../helpers/constants';
import { ReplaySubject } from 'rxjs';
import { Cluster, MembersData } from '../helpers/types';

export const createDiscovery: DiscoveryApi.CreateDiscovery = ({
  address,
  itemsToPublish,
  seedAddress,
  logger,
  debug,
}: DiscoveryApi.DiscoveryOptions): Promise<DiscoveryApi.Discovery> => {
  const membersState: { [member: string]: boolean } = {};

  return new Promise((resolve, reject) => {
    validateAddress(address, false);

    if (seedAddress) {
      validateAddress(seedAddress, false);
      validateAddressCollision(address, seedAddress);
    }

    check.assertArray(itemsToPublish, INVALID_ITEMS_TO_PUBLISH);

    const discoveredItemsSubject = new ReplaySubject<DiscoveryApi.ServiceDiscoveryEvent>();

    joinCluster({ address, seedAddress, itemsToPublish, transport: null, logger, debug })
      .then((cluster: Cluster) => {
        const clusterListener = cluster.listen$();
        let subscription: any;

        resolve(
          Object.freeze({
            destroy: () => {
              subscription && subscription.unsubscribe();
              discoveredItemsSubject.complete();
              return cluster
                .destroy()
                .then(() =>
                  Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(address)).catch((error: any) =>
                    Promise.reject(error)
                  )
                );
            },
            discoveredItems$: () => {
              cluster
                .getCurrentMemberStates()
                .then((currentMembersState: MembersData) => {
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
                        discoveredItemsSubject.next({
                          type: 'REGISTERED',
                          items: memberItem,
                        });
                        membersState[member] = true;
                      }
                    }
                  });
                })
                .catch((error: any) => discoveredItemsSubject.error(error));

              subscription = clusterListener.subscribe(
                (clusterEvent: ClusterEvent) => {
                  const { type, items, from } = clusterEvent;
                  if (items.length > 0) {
                    if (type === 'REMOVED' && membersState[from]) {
                      discoveredItemsSubject.next({
                        type: 'UNREGISTERED',
                        items,
                      });
                      membersState[from] = false;
                    }

                    if (type !== 'REMOVED' && !membersState[from]) {
                      discoveredItemsSubject.next({
                        type: 'REGISTERED',
                        items,
                      });
                      membersState[from] = true;
                    }
                  }
                },
                (error: any) => discoveredItemsSubject.error(error),
                () => discoveredItemsSubject.complete()
              );

              return discoveredItemsSubject.asObservable();
            },
          })
        );
      })
      .catch((error: any) => reject(error));
  });
};

const validateAddressCollision = (address: Address, seedAddress: Address) => {
  const fullAddress = getFullAddress(address);
  const fullSeedAddress = getFullAddress(seedAddress);
  if (fullAddress === fullSeedAddress) {
    throw new Error(getAddressCollision(fullAddress, fullSeedAddress));
  }
};
