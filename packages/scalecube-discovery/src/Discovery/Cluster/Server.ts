import {
  ADDED,
  ClusterEvent,
  getMembershipEvent,
  INIT,
  keysAsArray,
  saveToLogs,
  MEMBERSHIP_EVENT,
  MESSAGE,
  REMOVED,
} from './JoinCluster';
import { MembersMap, MembersPort } from '../../helpers/types';
import { ReplaySubject } from 'rxjs';

export const server = (options: {
  whoAmI: string;
  itemsToPublish: any[];
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  membersStatus: MembersMap;
  updateConnectedMember: (...data: any[]) => any;
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}) => {
  const { whoAmI, itemsToPublish, rSubjectMembers, membersStatus, updateConnectedMember, logger, debug } = options;
  const globalEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    if (evType === MEMBERSHIP_EVENT) {
      const { metadata, type, to, from } = membershipEvent;

      if (to !== whoAmI) {
        return;
      }

      const mPort = ev.ports[0];
      membersStatus.membersPort[from] = mPort;
      // response to initiator of the contact with all members data
      mPort.postMessage(
        getMembershipEvent({
          from: to,
          to: from,
          metadata: { ...membersStatus.membersState, [whoAmI]: itemsToPublish },
          type: INIT,
        })
      );

      mPort.addEventListener(MESSAGE, portEventsHandler);
      mPort.start();

      saveToLogs(
        `${whoAmI} server received ${type} request from ${from}`,
        {
          membersState: membersStatus.membersState,
          portList: keysAsArray(membersStatus.membersPort),
        },
        logger,
        debug
      );
    }
  };

  const portEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    if (evType === MEMBERSHIP_EVENT) {
      const { metadata, type, from, to } = membershipEvent;

      updateConnectedMember({ metadata, type });

      if (type === ADDED) {
        membersStatus.membersState[from] = metadata;
        // saveToLogs({ whoAmI, action: 'ADDED', current: membersData, prev: prevState });
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
            })
          );

          membersStatus.membersPort[from].close();
        }

        saveToLogs(
          `${whoAmI} server received ${type} request from ${from}`,
          {
            membersState: membersStatus.membersState,
            portList: keysAsArray(membersStatus.membersPort),
          },
          logger,
          debug
        );
      }

      rSubjectMembers &&
        rSubjectMembers.next({
          type,
          items: metadata[from],
        });
    }
  };

  return {
    start: () => {
      addEventListener(MESSAGE, globalEventsHandler);
      saveToLogs(
        `${whoAmI} server start`,
        {
          membersState: membersStatus.membersState,
          portList: keysAsArray(membersStatus.membersPort),
        },
        logger,
        debug
      );
    },
    stop: () => {
      removeEventListener(MESSAGE, globalEventsHandler);

      const membersList = keysAsArray(membersStatus.membersPort);
      membersList.forEach((to) => {
        const mPort = membersStatus.membersPort[to];
        mPort &&
          mPort.postMessage(
            getMembershipEvent({
              to,
              from: whoAmI,
              metadata: {
                [whoAmI]: itemsToPublish,
              },
              type: REMOVED,
            })
          );

        mPort.removeEventListener(MESSAGE, portEventsHandler);
        mPort.close();

        saveToLogs(
          `${whoAmI} server close`,
          {
            membersState: membersStatus.membersState,
            portList: keysAsArray(membersStatus.membersPort),
          },
          logger,
          debug
        );
      });

      return Promise.resolve('');
    },
  };
};
