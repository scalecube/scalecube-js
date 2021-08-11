import { Subject } from 'rxjs';
// @ts-ignore
import Swim from 'swim';
import { ClusterApi } from '@scalecube/api';
import { getFullAddress, saveToLogs } from '@scalecube/utils';
import { SwimEvent } from '../helpers/types';

export const joinCluster: ClusterApi.JoinCluster = (options: ClusterApi.ClusterOptions) => {
  const { address, seedAddress, itemsToPublish, retry = { timeout: 500 }, debug } = options;

  const whoAmI = `${address.host}:${address.port}`;
  const swimStatusConverter = ['ADDED', 'IDLE', 'REMOVED'];
  const opts = {
    local: {
      host: `${address.host}:${address.port}`,
      meta: {
        from: getFullAddress(address),
        items: itemsToPublish,
      }, // optional
    },
    codec: 'msgpack', // optional
    disseminationFactor: 15, // optional
    interval: 100, // optional
    joinTimeout: 200, // optional
    pingTimeout: 20, // optional
    pingReqTimeout: 60, // optional
    pingReqGroupSize: 3, // optional
    suspectTimeout: 60, // optional
    udp: { maxDgramSize: 4096 }, // optional
    preferCurrentMeta: true, // optional
  };

  let membersStatus: ClusterApi.MembersData = {};
  const delayedActions: any[] = [];
  let isConnected = !seedAddress;

  const swim = new Swim(opts);

  const sMembers = new Subject<ClusterApi.ClusterEvent>();
  const hostsToJoin = seedAddress ? seedAddress.map((seed) => `${seed.host}:${seed.port}`) : [];

  const retryTimer = setInterval(() => {
    swim.join(hostsToJoin);
  }, retry.timeout);

  swim.bootstrap(hostsToJoin);
  // bootstrap error handling
  swim.on(Swim.EventType.Error, function onError(err: Error) {
    saveToLogs(whoAmI, `swim-js error: ${err}`, {}, debug, 'warn');
  });

  // bootstrap ready
  swim.on(Swim.EventType.Ready, function onReady() {
    clearInterval(retryTimer);
    isConnected = true;
    if (delayedActions.length > 0) {
      delayedActions.forEach((action: any) => action && action());
    }
  });

  // update on membership, e.g. node recovered or update on meta data
  swim.on(Swim.EventType.Update, function onUpdate({ state, meta, host }: SwimEvent) {
    const { from, items } = meta;

    switch (state) {
      case 0: // SwimEventAlive
        membersStatus = { ...membersStatus, [from]: items };
        break;
      case 1: // SwimEventSuspect
        break;
      case 2: // SwimEventFaulty
        delete membersStatus[from];
        break;
    }

    // @ts-ignore
    sMembers.next({
      type: swimStatusConverter[state] as ClusterApi.MemberEventType,
      items,
      from,
    });

    saveToLogs(
      whoAmI,
      `${whoAmI} received ${swimStatusConverter[state]} request from ${host}`,
      {
        membersState: { ...membersStatus },
      },
      debug
    );
  });

  return Object.freeze({
    listen$: () => sMembers.asObservable(),
    getCurrentMembersData: () =>
      new Promise<ClusterApi.MembersData>((resolve) => {
        const getMemberStateCluster = () => {
          resolve({ ...membersStatus });
        };
        if (!isConnected) {
          delayedActions.push(getMemberStateCluster);
        } else {
          getMemberStateCluster();
        }
      }),
    destroy: () => {
      return new Promise((resolve) => {
        const destroyCluster = () => {
          swim.leave();
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
