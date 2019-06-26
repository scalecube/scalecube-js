import { getFullAddress, getAddress } from '@scalecube/utils';
import { Address, DiscoveryApi } from '@scalecube/api';
import { ClusterEvent, joinCluster } from './Cluster/JoinCluster';
import { ADDRESS_DESTROYED, getAddressCollision, getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const';
import { Subject } from 'rxjs';
import { Cluster, MembersMap } from '../helpers/types';

export const createDiscovery: DiscoveryApi.CreateDiscovery = ({
  address,
  itemsToPublish,
  seedAddress,
  logger,
  debug,
}: DiscoveryApi.DiscoveryOptions): Promise<DiscoveryApi.Discovery> => {
  return new Promise((resolve, reject) => {
    if (!address) {
      address = getAddress('address');
    }

    seedAddress && validateAddressCollision(address, seedAddress);

    const discoveredItemsSubject = new Subject<DiscoveryApi.ServiceDiscoveryEvent>();

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
                .then((currentMembersState: MembersMap) => {
                  const members = Object.values(currentMembersState);
                  members.forEach((memberItem: any) => {
                    discoveredItemsSubject.next({
                      type: memberItem.length > 0 ? 'REGISTERED' : 'IDLE',
                      items: memberItem,
                    });

                    subscription = clusterListener.subscribe(
                      (clusterEvent: ClusterEvent) => {
                        const { type, items } = clusterEvent;

                        discoveredItemsSubject.next({
                          type: type === 'REMOVED' ? 'UNREGISTERED' : 'REGISTERED',
                          items,
                        });
                      },
                      (error: any) => discoveredItemsSubject.error(error),
                      () => discoveredItemsSubject.complete()
                    );
                  });
                })
                .catch((error: any) => discoveredItemsSubject.error(error));
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
