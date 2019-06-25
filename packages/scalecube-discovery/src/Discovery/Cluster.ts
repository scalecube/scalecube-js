import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import { Cluster, ConnectType, MemberEventType, MembershipEvent, MembersMap, MembersPort } from '../helpers/types';

const MEMBERSHIP_EVENT = 'membershipEvent';
const MESSAGE = 'message';
const WINDOW = 'window';
const ADDED = 'ADDED';
const REMOVED = 'REMOVED';
const INIT = 'INIT';
const PORT = 'port';

export const joinCluster = ({
  address,
  seedAddress,
  itemsToPublish,
  transport,
}: {
  address: Address;
  seedAddress?: Address;
  itemsToPublish: any;
  transport: any;
}): Promise<Cluster> => {
  const { port1, port2 } = new MessageChannel();
  const whoAmI = getFullAddress(address);
  let membersData: MembersMap = {};
  const membersPorts: MembersPort = {};
  const rSubjectMembers = new ReplaySubject<ClusterEvent>(1);

  const connect = (ev: any, connectType: ConnectType) => {
    const { type: evType, detail: membershipEvent } = ev.data;

    if (evType === MEMBERSHIP_EVENT) {
      const { metadata, type, sendToMember } = membershipEvent;
      if (whoAmI && sendToMember && sendToMember === whoAmI) {
        membersData = openedConnection({
          connectType,
          metadata,
          mPort: connectType === WINDOW ? ev.ports[0] : null,
          type,
          membersPorts,
          membersData,
          whoAmI,
          itemsToPublish,
          rSubjectMembers,
        });
      }
    }
  };

  return new Promise((resolve: any, reject: any) => {
    const windowConnection = (ev: any) =>
      connect(
        ev,
        WINDOW
      );
    const portConnection = (ev: any) => {
      connect(
        ev,
        PORT
      );
      resolve(cluster);
    };
    addEventListener(MESSAGE, windowConnection);

    const cluster = Object.assign({
      getCurrentMemberStates: () => Promise.resolve(membersData),
      listen$: () => rSubjectMembers.asObservable(),
      destroy: () => {
        const reportToMember = Object.keys(membersData);
        reportToMember.forEach((sendToMember) => {
          membersPorts[sendToMember] &&
            membersPorts[sendToMember].postMessage(
              getMembershipEvent({
                metadata: {
                  [whoAmI]: itemsToPublish,
                },
                type: REMOVED,
                sendToMember,
              })
            );
        });

        removeEventListener(MESSAGE, windowConnection);
        removeEventListener(MESSAGE, portConnection);
        port1.close();
        rSubjectMembers.complete();
        logger({ whoAmI, action: 'close', current: membersData, prev: {} });
        return Promise.resolve('');
      },
    });

    if (!seedAddress) {
      return resolve(cluster);
    }

    port1.addEventListener(MESSAGE, portConnection);
    logger({ whoAmI, action: 'start', current: membersData, prev: {} });
    port1.start();

    const seed = getFullAddress(seedAddress);
    postMessage(
      getMembershipEvent({
        metadata: {
          [whoAmI]: itemsToPublish,
        },
        type: INIT,
        sendToMember: seed,
      }),
      '*',
      [port2]
    );
  });
};

const openedConnection = (options: ClusterConnectionOptions) => {
  const { connectType, metadata, type, mPort, whoAmI, itemsToPublish, membersPorts, rSubjectMembers } = options;
  let { membersData } = options;

  if (connectType === WINDOW && mPort) {
    const [newMember] = Object.keys(metadata);
    // response to initiator of the contact with all members data
    mPort.postMessage(
      getMembershipEvent({
        metadata: { ...membersData, [whoAmI]: itemsToPublish },
        type: INIT,
        sendToMember: newMember,
      })
    );

    const serverPortConnection = (ev: any) => {
      const { type: evType, detail: membershipEvent } = ev.data;
      if (evType === MEMBERSHIP_EVENT) {
        const { metadata: receivedMetadata, type: receivedType } = membershipEvent;
        addRemoveMember({
          metadata: receivedMetadata,
          type: receivedType,
          membersData,
          membersPorts,
          rSubjectMembers,
          whoAmI,
          mPort,
        });
      }
    };

    mPort.addEventListener(MESSAGE, serverPortConnection);
    mPort.start();

    updateConnectedMembers({ ...options, type: ADDED });
    // add new member port to the membersPorts
    membersPorts[newMember] = mPort;

    updateSubject({ ...options, member: newMember, type: ADDED, metadata });
  }
  if (type === INIT) {
    const prevState = { ...membersData };

    membersData = { ...membersData, ...metadata };
    logger({ whoAmI, action: 'INIT', current: membersData, prev: prevState });
  } else if (connectType === PORT) {
    addRemoveMember({ ...options });
  }

  return membersData;
};

const getMembershipEvent = ({
  metadata,
  type,
  sendToMember,
}: {
  metadata: any;
  type: MemberEventType;
  sendToMember: string;
}) => ({
  detail: {
    metadata,
    type,
    sendToMember,
  },
  type: MEMBERSHIP_EVENT,
});

const addRemoveMember = (options: {
  metadata: MembersMap;
  membersData: MembersMap;
  type: MemberEventType;
  membersPorts: MembersPort;
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  whoAmI: string;
  mPort?: MessagePort;
}) => {
  const { metadata, membersData, type, membersPorts, whoAmI, mPort } = options;
  const [newMember] = Object.keys(metadata);
  updateConnectedMembers({ ...options, membersData });

  const prevState = { ...membersData };

  if (type === ADDED) {
    membersData[newMember] = metadata;
    logger({ whoAmI, action: 'ADDED', current: membersData, prev: prevState });
  } else {
    if (membersData[newMember]) {
      delete membersData[newMember];
    }

    mPort &&
      mPort.postMessage(
        getMembershipEvent({
          type: 'CLOSE',
          metadata: {},
          sendToMember: newMember,
        })
      );
    membersPorts[newMember] && membersPorts[newMember].close();
    logger({ whoAmI, action: 'REMOVED', current: membersData, prev: prevState });
  }

  updateSubject({ ...options, member: newMember, metadata });
};

const updateConnectedMembers = (options: {
  membersPorts: MembersPort;
  membersData: MembersMap;
  type: MemberEventType;
}) => {
  const { membersPorts, membersData, type } = options;
  // update all connected clusters on the new member
  Object.keys(membersPorts).forEach((nextMember: string) => {
    const mPort: MessagePort = membersPorts[nextMember];
    mPort.postMessage(
      getMembershipEvent({
        metadata: membersData,
        type,
        sendToMember: nextMember,
      })
    );
  });
};

const updateSubject = (options: {
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  member: string;
  type: MemberEventType;
  metadata: MembersMap;
}) => {
  const { rSubjectMembers, member, type, metadata } = options;
  // update Subject
  rSubjectMembers.next({
    type,
    items: metadata[member],
  });
};

interface ClusterConnectionOptions {
  connectType: ConnectType;
  metadata: any;
  type: MemberEventType;
  mPort?: MessagePort;
  whoAmI: string;
  membersData: any;
  membersPorts: any;
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  itemsToPublish: any;
}

export interface ClusterEvent {
  type: MemberEventType;
  items: [];
}

const logger = ({
  whoAmI,
  prev,
  current,
  action,
}: {
  whoAmI: string;
  prev: MembersMap;
  current: MembersMap;
  action: string;
}) => {
  (window as MembersMap).logger = (window as MembersMap).logger || [];
  const state = {
    action,
    whoAmI,
    state: {
      prev,
      current,
    },
  };

  console.log('logger', state);
  // @ts-ignore
  window.logger.push(state);
};
