import { ClusterEvent } from './JoinCluster';
import { MembersMap } from '../../helpers/types';
import { ReplaySubject } from 'rxjs';
import {
  saveToLogs,
  getKeysAsArray,
  MEMBERSHIP_EVENT,
  INIT,
  MESSAGE,
  REMOVED,
  ADDED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
} from './utils';

interface ClusterServer {
  whoAmI: string;
  itemsToPublish: any[];
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  membersStatus: MembersMap;
  updateConnectedMember: (...data: any[]) => any;
  getMembershipEvent: (...data: any[]) => any;
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}

export const server = (options: ClusterServer) => {
  const {
    whoAmI,
    itemsToPublish,
    rSubjectMembers,
    membersStatus,
    updateConnectedMember,
    getMembershipEvent,
    logger,
    debug,
  } = options;
  const globalEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    if (evType === MEMBERSHIP_EVENT) {
      const { metadata, type, to, from, origin } = membershipEvent;

      if (origin === whoAmI || from === whoAmI || from === to || to !== whoAmI) {
        return;
      }

      saveToLogs(
        `${whoAmI} server received ${type} request from ${from}`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
        },
        logger,
        debug
      );

      const mPort: MessagePort = ev && ev.ports && ev.ports[0];
      if (!mPort) {
        console.error(`Address collusion ${whoAmI} and ${from}`);
      }

      mPort.addEventListener(MESSAGE, portEventsHandler);
      mPort.start();

      // 1. response to initiator of the contact with all members data
      mPort.postMessage(
        getMembershipEvent({
          from: whoAmI,
          to: from,
          origin: whoAmI,
          metadata: { ...membersStatus.membersState, [whoAmI]: itemsToPublish },
          type: INIT,
        })
      );

      // 2. update membersState
      membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
      updateConnectedMember({ metadata, type: ADDED, from, to, origin });
      // 3. update ports
      membersStatus.membersPort = { ...membersStatus.membersPort, [from]: mPort };

      rSubjectMembers &&
        rSubjectMembers.next({
          type,
          items: metadata[origin],
          from: origin,
        });
    }

    if (evType === MEMBERSHIP_EVENT_INIT_SERVER) {
      const { to, origin } = membershipEvent;
      if (to === whoAmI && to !== origin) {
        postMessage(
          {
            detail: {
              from: whoAmI,
              to: origin,
              origin,
            },
            type: MEMBERSHIP_EVENT_INIT_CLIENT,
          },
          '*'
        );
      }
    }
  };

  const portEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    const { metadata, type, from, to } = membershipEvent;

    if (origin === whoAmI || from === whoAmI) {
      return;
    }

    updateConnectedMember({ metadata, type, from, to, origin });
    if (type === ADDED || type === INIT) {
      membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
    } else {
      if (membersStatus.membersState[from]) {
        delete membersStatus.membersState[from];
      }

      const mPort = membersStatus.membersPort[from];
      if (mPort) {
        mPort.postMessage(
          getMembershipEvent({
            type: 'CLOSE',
            metadata: {},
            to: from,
            from: to,
            origin: whoAmI,
          })
        );

        membersStatus.membersPort[from].close();
      }
    }

    saveToLogs(
      `${whoAmI} server received ${type} request from ${from}`,
      {
        membersState: { ...membersStatus.membersState },
        membersPort: { ...membersStatus.membersPort },
      },
      logger,
      debug
    );

    rSubjectMembers &&
      rSubjectMembers.next({
        type,
        items: metadata[from],
        from: origin,
      });
  };

  return {
    start: () => {
      addEventListener(MESSAGE, globalEventsHandler);
    },
    stop: () => {
      removeEventListener(MESSAGE, globalEventsHandler);

      const membersList = getKeysAsArray({ ...membersStatus.membersPort });
      membersList.forEach((to) => {
        const mPort = membersStatus.membersPort[to];
        mPort &&
          mPort.postMessage(
            getMembershipEvent({
              to,
              from: whoAmI,
              origin: whoAmI,
              metadata: {
                [whoAmI]: itemsToPublish,
              },
              type: REMOVED,
            })
          );

        mPort.removeEventListener(MESSAGE, portEventsHandler);
        mPort.close();
      });

      return Promise.resolve('');
    },
  };
};
