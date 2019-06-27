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
  retry: {
    timeout: number;
  };
  seed: string;
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}) => {
  const {
    whoAmI,
    membersStatus,
    updateConnectedMember,
    itemsToPublish,
    rSubjectMembers,
    logger,
    debug,
    retry,
    seed,
  } = options;
  const { port1, port2 } = new MessageChannel();

  let portEventsHandler = (ev: any) => {};

  let retryTimer: any = null;

  return {
    start: () =>
      new Promise((resolve, reject) => {
        portEventsHandler = (ev: any) => {
          const { type: evType, detail: membershipEvent } = ev.data;
          if (evType === MEMBERSHIP_EVENT) {
            const { metadata, type, from, to, origin } = membershipEvent;
            membersStatus.membersState = { ...membersStatus.membersState, ...metadata };

            if (type === INIT) {
              clearInterval(retryTimer);

              resolve();
            } else {
              // console.log('whoAmI', whoAmI, 'seed ', seed, 'type ', type, 'from ', from, 'to ', to, 'metadata: ', metadata);
              updateConnectedMember({ metadata, type, from, to });
            }

            saveToLogs(
              `${whoAmI} client received ${type} request from ${from}`,
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
          }
        };

        port1.addEventListener(MESSAGE, portEventsHandler);
        port1.start();

        // saveToLogs(`${whoAmI} start client`, {
        //   membersState: { ...membersStatus.membersState },
        //   membersPort: { ...membersStatus.membersPort },
        // }, logger, debug);

        retryTimer = setTimeout(() => {
          postMessage(
            getMembershipEvent({
              metadata: {
                [whoAmI]: itemsToPublish,
              },
              type: INIT,
              to: seed,
              from: whoAmI,
              origin: whoAmI,
            }),
            '*',
            [port2]
          );
        }, retry.timeout);
      }),
    stop: () => {
      updateConnectedMember({
        metadata: {
          [whoAmI]: itemsToPublish,
        },
        type: REMOVED,
        from: whoAmI,
        to: null,
      });

      port2.postMessage(
        getMembershipEvent({
          metadata: {
            [whoAmI]: itemsToPublish,
          },
          type: REMOVED,
          from: whoAmI,
          to: seed,
          origin: whoAmI,
        })
      );
      port1.removeEventListener(MESSAGE, portEventsHandler);
      port1.close();
      port2.close();
      saveToLogs(
        `${whoAmI} close client`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
        },
        logger,
        debug
      );
    },
  };
};
