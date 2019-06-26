import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { Cluster, MemberEventType, MembersMap } from '../../helpers/types';
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
  debug,
  logger,
}: {
  address: Address;
  seedAddress?: Address;
  itemsToPublish: any;
  transport: any;
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

  let serverPort: any = null;
  let clientPort: any = null;
  const updateConnectedMember = ({ type, metadata }: { type: MemberEventType; metadata: MembersMap }) => {
    const { membersPort } = membersStatus;

    Object.keys(membersPort).forEach((nextMember: string) => {
      const mPort: MessagePort = membersPort[nextMember];
      mPort.postMessage(
        getMembershipEvent({
          from: whoAmI,
          to: nextMember,
          metadata,
          type,
        })
      );
    });
  };

  const cluster = Object.assign({
    getCurrentMemberStates: () => {
      const { membersState } = membersStatus;
      saveToLogs(`${whoAmI} current state`, membersState, logger, debug);
      return Promise.resolve(membersState);
    },
    listen$: () => rSubjectMembers.asObservable(),
    destroy: () => {
      clientPort && clientPort.stop();
      serverPort && serverPort.stop();
      rSubjectMembers.complete();
      return Promise.resolve('');
    },
  });

  serverPort = server({ whoAmI, membersStatus, rSubjectMembers, itemsToPublish, updateConnectedMember, logger, debug });
  serverPort.start();

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
        logger,
        debug,
      });
      clientPort.start(to).then(() => {
        const { membersState, membersPort } = membersStatus;
        saveToLogs(
          `${whoAmI} established connection with ${to}`,
          {
            membersState,
            portList: keysAsArray(membersPort),
          },
          logger,
          debug
        );

        resolve(cluster);
      });
    }
  });
};

export const getMembershipEvent = ({
  from,
  to,
  metadata,
  type,
}: {
  from: string;
  to: string;
  metadata: any;
  type: MemberEventType;
}) => ({
  detail: {
    metadata,
    type,
    from,
    to,
  },
  type: MEMBERSHIP_EVENT,
});

export interface ClusterEvent {
  type: MemberEventType;
  items: [];
}

export const saveToLogs = (msg: string, extra: {}, logger?: { namespace: string }, debug?: boolean) => {
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

  // tslint:disable-next-line
  debug && console.log('logger', state);
};

export const keysAsArray = (obj: {}) => Object.keys(obj) || [];
