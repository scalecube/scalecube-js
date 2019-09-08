import { Subject } from 'rxjs';
import { ClusterApi } from '@scalecube/api';
import { getFullAddress, saveToLogs } from '@scalecube/utils';
import { server } from './Server';
import { client } from './Client';
import { createMember } from './Member';

export const joinCluster: ClusterApi.JoinCluster = (options: ClusterApi.ClusterOptions) => {
  const { address, seedAddress, itemsToPublish, retry, debug } = options;
  const { port1, port2 } = new MessageChannel();
  const membersStatus: ClusterApi.MembersMap = {
    membersPort: {},
    membersState: {},
  };

  const delayedActions: any[] = [];
  let isConnected = !seedAddress;

  const rSubjectMembers = new Subject<ClusterApi.ClusterEvent>();

  let clientPort: any;

  const { updateConnectedMember, getMembershipEvent, whoAmI } = createMember(address, membersStatus);

  const serverPort = server({
    whoAmI,
    membersStatus,
    rSubjectMembers,
    itemsToPublish,
    updateConnectedMember,
    getMembershipEvent,
    port1,
    seed: seedAddress ? getFullAddress(seedAddress) : undefined,
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
    port1,
    port2,
    retry: retry || {
      timeout: 10,
    },
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
    listen$: () => rSubjectMembers.asObservable(),
    getCurrentMembersData: () =>
      new Promise<ClusterApi.MembersData>((resolve, reject) => {
        const getMemberStateCluster = () => {
          resolve({ ...membersStatus.membersState });
        };
        if (!isConnected) {
          delayedActions.push(getMemberStateCluster);
        } else {
          getMemberStateCluster();
        }
      }),
    destroy: () => {
      return new Promise((resolve, reject) => {
        const destroyCluster = async () => {
          try {
            await serverPort.stop();
            clientPort && (await clientPort.stop());
          } catch (e) {
            saveToLogs(whoAmI, `unable to destroy ${whoAmI}: ${e}`, {}, debug, 'warn');
          }
          rSubjectMembers.complete();
          membersStatus.membersPort = {};
          membersStatus.membersState = {};

          resolve('');
        };

        if (!isConnected) {
          delayedActions.push(destroyCluster);
        } else {
          return destroyCluster();
        }
      });
    },
  } as ClusterApi.Cluster);
};
