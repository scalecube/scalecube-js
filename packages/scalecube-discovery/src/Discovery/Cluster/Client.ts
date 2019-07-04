import { ClusterEvent } from './JoinCluster';
import { MembersMap } from '../../helpers/types';
import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import {
  MEMBERSHIP_EVENT,
  saveToLogs,
  INIT,
  MESSAGE,
  REMOVED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
  ADDED,
  genericPostMessage,
} from './utils';

interface ClusterClient {
  whoAmI: string;
  membersStatus: MembersMap;
  updateConnectedMember: (...data: any[]) => any;
  getMembershipEvent: (...data: any[]) => any;
  itemsToPublish: any[];
  port1: MessagePort;
  port2: MessagePort;
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  retry: {
    timeout: number;
  };
  seedAddress: Address | void;
  debug?: boolean;
  logger?: {
    namespace: string;
  };
}

export const client = (options: ClusterClient) => {
  const {
    whoAmI,
    membersStatus,
    updateConnectedMember,
    getMembershipEvent,
    itemsToPublish,
    rSubjectMembers,
    port1,
    port2,
    logger,
    debug,
    retry,
    seedAddress,
  } = options;

  let seed = '';
  let portEventsHandler = (ev: any) => {};

  let globalEventsHandler = (ev: any) => {};

  let retryTimer: any = null;

  return Object.freeze({
    start: () =>
      new Promise((resolve, reject) => {
        if (!seedAddress) {
          resolve();
        } else {
          seed = getFullAddress(seedAddress);

          portEventsHandler = (ev: any) => {
            const { type: evType, detail: membershipEvent } = ev.data;
            if (evType === MEMBERSHIP_EVENT) {
              const { metadata, type, from, to, origin } = membershipEvent;

              if (origin === whoAmI || from === whoAmI || from === to) {
                return;
              }

              // console.log(`whoAmI ${whoAmI} seed ${seed} type ${type} from ${from} to ${to} metadata ${metadata}`);

              if (type === INIT) {
                clearInterval(retryTimer);
                removeEventListener(MESSAGE, globalEventsHandler);
                retryTimer = null;
                resolve();
              }

              membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
              updateConnectedMember({ metadata, type: type === INIT ? ADDED : type, from, to, origin });

              saveToLogs(
                `${whoAmI} client received ${type} request from ${from}`,
                {
                  membersState: { ...membersStatus.membersState },
                  membersPort: { ...membersStatus.membersPort },
                },
                logger,
                debug
              );

              Object.keys(metadata).forEach((member: string) => {
                rSubjectMembers &&
                  rSubjectMembers.next({
                    type,
                    items: metadata[member],
                    from: origin,
                  });
              });
            }
          };

          globalEventsHandler = (ev: any) => {
            const { type: evType, detail: membershipEvent } = ev.data;
            if (evType === MEMBERSHIP_EVENT_INIT_CLIENT) {
              const { from, origin } = membershipEvent;
              if (from === seed && origin && origin === whoAmI) {
                port1.addEventListener(MESSAGE, portEventsHandler);
                port1.start();

                clearInterval(retryTimer);
                removeEventListener(MESSAGE, globalEventsHandler);
                retryTimer = null;

                genericPostMessage(
                  getMembershipEvent({
                    metadata: {
                      [whoAmI]: itemsToPublish,
                    },
                    type: INIT,
                    to: seed,
                    from: whoAmI,
                    origin: whoAmI,
                  }),
                  [port2]
                );
              }
            }
          };

          addEventListener(MESSAGE, globalEventsHandler);

          retryTimer = setInterval(() => {
            genericPostMessage({
              detail: {
                origin: whoAmI,
                to: seed,
              },
              type: MEMBERSHIP_EVENT_INIT_SERVER,
            });
          }, retry.timeout);
        }
      }),
    stop: () => {
      updateConnectedMember({
        metadata: {
          [whoAmI]: itemsToPublish,
        },
        type: REMOVED,
        from: whoAmI,
        to: null,
        origin: whoAmI,
      });

      port1.postMessage(
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

      removeEventListener(MESSAGE, globalEventsHandler);
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
  });
};
