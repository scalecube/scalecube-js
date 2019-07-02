import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { Cluster, MemberEventType, MembersMap } from '../../helpers/types';
import { server } from './Server';
import { client } from './Client';
import { utils } from './utils';

interface JoinCluster {
  address: Address;
  seedAddress?: Address;
  itemsToPublish: any;
  transport: any;
  retry?: {
    timeout: number;
  };
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}

export const joinCluster = (options: JoinCluster): Cluster => {
  const { address, seedAddress, itemsToPublish, transport, retry, debug, logger } = options;

  const membersStatus: MembersMap = {
    membersPort: {},
    membersState: {},
  };

  const delayedActions: any[] = [];
  let isConnected = !seedAddress;

  const rSubjectMembers = new ReplaySubject<ClusterEvent>(1);
  const whoAmI = getFullAddress(address);

  let clientPort: any;

  const { updateConnectedMember, getMembershipEvent } = utils(whoAmI, membersStatus);

  const serverPort = server({
    whoAmI,
    membersStatus,
    rSubjectMembers,
    itemsToPublish,
    updateConnectedMember,
    getMembershipEvent,
    logger,
    debug,
  });
  serverPort.start();
  clientPort = client({
    whoAmI,
    updateConnectedMember,
    getMembershipEvent,
    membersStatus,
    itemsToPublish,
    rSubjectMembers,
    retry: retry || {
      timeout: 500,
    },
    logger,
    debug,
    seedAddress,
  });

  clientPort.start().then(() => {
    isConnected = true;
    if (delayedActions.length > 0) {
      delayedActions.forEach((action: any) => action && action());
    }
  });

  return Object.freeze({
    getCurrentMemberStates: () => Promise.resolve({ ...membersStatus.membersState }),
    listen$: () => rSubjectMembers.asObservable(),
    destroy: () => {
      return new Promise((resolve, reject) => {
        const destroyCluster = () => {
          clientPort && clientPort.stop();
          serverPort.stop();
          rSubjectMembers.complete();
          resolve('');
        };

        if (!isConnected) {
          delayedActions.push(destroyCluster);
        } else {
          destroyCluster();
        }
      });
    },
  }) as Cluster;
};

export interface ClusterEvent {
  type: MemberEventType;
  items: [];
  from: string;
}
