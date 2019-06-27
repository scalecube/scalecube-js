import { getFullAddress, getAddress } from '@scalecube/utils';
import { Address, DiscoveryApi } from '@scalecube/api';
import { ClusterEvent, joinCluster } from './Cluster/JoinCluster';
import { ADDRESS_DESTROYED, getAddressCollision, getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const';
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
    if (!address) {
      address = getAddress('address');
    }

    seedAddress && validateAddressCollision(address, seedAddress);

    const discoveredItemsSubject = new ReplaySubject<DiscoveryApi.ServiceDiscoveryEvent>();

    joinCluster({ address, seedAddress, itemsToPublish, transport: null, logger, debug })
      .then((cluster: Cluster) => {
        const clusterListener = cluster.listen$();
        let subscription: any;

        resolve(
          Object.freeze({
            destroy: () => {
              subscription && subscription.unsubscribe();
              if (!address) {
                return Promise.reject(ADDRESS_DESTROYED);
              }
              const tempAddress = address;
              discoveredItemsSubject.complete();
              return cluster
                .destroy()
                .then(() =>
                  Promise.resolve(getDiscoverySuccessfullyDestroyedMessage(tempAddress)).catch((error: any) =>
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
  if (getFullAddress(address) === getFullAddress(seedAddress)) {
    throw new Error(getAddressCollision(address, seedAddress));
  }
};
