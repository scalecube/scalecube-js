import {
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

export const client = (options: {
  whoAmI: string;
  membersStatus: MembersMap;
  updateConnectedMember: (...data: any[]) => any;
  itemsToPublish: any[];
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}) => {
  const { whoAmI, membersStatus, updateConnectedMember, itemsToPublish, rSubjectMembers, logger, debug } = options;
  const { port1, port2 } = new MessageChannel();

  let portEventsHandler = (ev: any) => {};

  return {
    start: (to: string) =>
      new Promise((resolve, reject) => {
        portEventsHandler = (ev: any) => {
          const { type: evType, detail: membershipEvent } = ev.data;
          if (evType === MEMBERSHIP_EVENT) {
            const { metadata, type, from } = membershipEvent;

            membersStatus.membersState = { ...membersStatus.membersState, ...metadata };

            if (type === INIT) {
              resolve();
            } else {
              updateConnectedMember({ metadata, type });
            }

            saveToLogs(
              `${whoAmI} client received ${type} request from ${from}`,
              {
                membersState: membersStatus.membersState,
                portList: keysAsArray(membersStatus.membersPort),
              },
              logger,
              debug
            );

            rSubjectMembers &&
              rSubjectMembers.next({
                type,
                items: metadata[from],
              });
          }
        };

        port1.addEventListener(MESSAGE, portEventsHandler);
        port1.start();
        const { membersState, membersPort } = membersStatus;
        saveToLogs(`${whoAmI} start client`, { membersState, portList: keysAsArray(membersPort) }, logger, debug);

        postMessage(
          getMembershipEvent({
            metadata: {
              [whoAmI]: itemsToPublish,
            },
            type: INIT,
            to,
            from: whoAmI,
          }),
          '*',
          [port2]
        );
      }),
    stop: () => {
      updateConnectedMember({
        metadata: {
          [whoAmI]: itemsToPublish,
        },
        type: REMOVED,
      });
      port1.removeEventListener(MESSAGE, portEventsHandler);
      port1.close();
      port2.close();
      saveToLogs(
        `${whoAmI} close client`,
        {
          membersState: membersStatus.membersState,
          portList: keysAsArray(membersStatus.membersPort),
        },
        logger,
        debug
      );
    },
  };
};
