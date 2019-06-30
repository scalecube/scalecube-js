import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { Cluster, MemberEventType, MembershipEvent, MembersMap } from '../../helpers/types';
import { server } from './Server';
import { client } from './Client';

export const MEMBERSHIP_EVENT = 'membershipEvent';
export const MESSAGE = 'message';
export const ADDED = 'ADDED';
export const REMOVED = 'REMOVED';
export const INIT = 'INIT';

export const joinCluster = ({
  address,
  seedAddress,
  itemsToPublish,
  transport,
  retry,
  debug,
  logger,
}: {
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
}): Promise<Cluster> => {
  const membersStatus: MembersMap = {
    membersPort: {},
    membersState: {},
  };

  const rSubjectMembers = new ReplaySubject<ClusterEvent>(1);
  const whoAmI = getFullAddress(address);

  let clientPort: any = null;

  const updateConnectedMember = ({
    type,
    metadata,
    from,
    to,
  }: {
    from: string;
    to: string;
    metadata: any;
    type: MemberEventType;
  }) => {
    const { membersPort } = membersStatus;

    Object.keys(membersPort).forEach((nextMember: string) => {
      if (from !== nextMember && whoAmI !== nextMember) {
        const mPort: MessagePort = membersPort[nextMember];
        mPort.postMessage(
          getMembershipEvent({
            from: whoAmI,
            to: nextMember,
            origin: from,
            metadata,
            type,
          })
        );
      }
    });
  };

  const serverPort = server({
    whoAmI,
    membersStatus,
    rSubjectMembers,
    itemsToPublish,
    updateConnectedMember,
    logger,
    debug,
  });
  serverPort.start();

  const cluster = Object.assign({
    getCurrentMemberStates: () => {
      saveToLogs(
        `${whoAmI} current state`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
        },
        logger,
        debug
      );
      return Promise.resolve({ ...membersStatus.membersState });
    },
    listen$: () => rSubjectMembers.asObservable(),
    destroy: () => {
      clientPort && clientPort.stop();
      serverPort.stop();
      rSubjectMembers.complete();
      return Promise.resolve('');
    },
  });

  return new Promise((resolve, reject) => {
    if (!seedAddress) {
      resolve(cluster);
    } else {
      const to = getFullAddress(seedAddress);
      clientPort = client({
        whoAmI,
        updateConnectedMember,
        membersStatus,
        itemsToPublish,
        rSubjectMembers,
        retry: retry || {
          timeout: 500,
        },
        logger,
        debug,
        seed: to,
      });
      clientPort.start().then(() => {
        saveToLogs(
          `${whoAmI} established connection with ${to}`,
          {
            membersState: { ...membersStatus.membersState },
            membersPort: { ...membersStatus.membersPort },
          },
          logger,
          debug
        );

        resolve(cluster);
      });
    }
  });
};

export const getMembershipEvent = ({ from, to, metadata, origin, type }: MembershipEvent) => ({
  detail: {
    metadata,
    type,
    from,
    origin,
    to,
  },
  type: MEMBERSHIP_EVENT,
});

export interface ClusterEvent {
  type: MemberEventType;
  items: [];
  from: string;
}

export const saveToLogs = (
  msg: string,
  extra: { [key: string]: any },
  logger?: { namespace: string },
  debug?: boolean
) => {
  const state = {
    msg,
    ...extra,
  };

  if (logger && logger.namespace) {
    // @ts-ignore
    window[namespace] = window[namespace] || {};
    // @ts-ignore
    window[namespace].cluster = window[namespace].cluster || [];

    // @ts-ignore
    logger && window.scalecube.cluster.push(state);
  }

  // tslint:disable
  debug && extra && extra.membersState && console.log(msg, 'membersState: ', extra.membersState);
  debug && extra && extra.membersPort && console.log(msg, 'membersPort: ', keysAsArray(extra.membersPort));
  // tslint:enable
};

export const keysAsArray = (obj: {}) => (obj && Object.keys(obj)) || [];
