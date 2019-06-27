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
import { MembersMap } from '../../helpers/types';
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
      const { metadata, type, to, from, origin } = membershipEvent;

      if (to !== whoAmI) {
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

      rSubjectMembers &&
        rSubjectMembers.next({
          type,
          items: metadata[origin],
          from: origin,
        });

      const mPort = ev.ports[0];

      // response to initiator of the contact with all members data
      mPort.postMessage(
        getMembershipEvent({
          from: whoAmI,
          to: from,
          origin: whoAmI,
          metadata: { ...membersStatus.membersState, [whoAmI]: itemsToPublish },
          type: INIT,
        })
      );

      membersStatus.membersPort = { ...membersStatus.membersPort, [from]: mPort };
      membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
      updateConnectedMember({ metadata, type: ADDED, from, to });

      saveToLogs(
        `${whoAmI} update ports`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
        },
        logger,
        debug
      );

      mPort.addEventListener(MESSAGE, portEventsHandler);
      mPort.start();
    }
  };

  const portEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    const { metadata, type, from, to } = membershipEvent;

    updateConnectedMember({ metadata, type, from, to });
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
      // saveToLogs(
      //   `${whoAmI} start server`,
      //   {
      //     membersState: { ...membersStatus.membersState },
      //     membersPort: { ...membersStatus.membersPort },
      //   },
      //   logger,
      //   debug
      // );
    },
    stop: () => {
      removeEventListener(MESSAGE, globalEventsHandler);

      const membersList = keysAsArray({ ...membersStatus.membersPort });
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

        // saveToLogs(
        //   `${whoAmI} close server`,
        //   {
        //     membersState: { ...membersStatus.membersState },
        //     membersPort: { ...membersStatus.membersPort },
        //   },
        //   logger,
        //   debug
        // );
      });

      return Promise.resolve('');
    },
  };
};
