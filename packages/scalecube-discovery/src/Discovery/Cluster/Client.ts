import { ClusterEvent, getMembershipEvent, INIT, saveToLogs, MEMBERSHIP_EVENT, MESSAGE, REMOVED } from './JoinCluster';
import { MembersMap } from '../../helpers/types';
import { ReplaySubject } from 'rxjs';
import { Address } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';

interface ClusterClient {
  whoAmI: string;
  membersStatus: MembersMap;
  updateConnectedMember: (...data: any[]) => any;
  itemsToPublish: any[];
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
    itemsToPublish,
    rSubjectMembers,
    logger,
    debug,
    retry,
    seedAddress,
  } = options;

  const { port1, port2 } = new MessageChannel();
  let seed = '';
  let portEventsHandler = (ev: any) => {};

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

              membersStatus.membersState = { ...membersStatus.membersState, ...metadata };

              if (type === INIT) {
                clearInterval(retryTimer);
                retryTimer = null;
                resolve();
              } else {
                saveToLogs(
                  `whoAmI ${whoAmI} seed ${seed} type ${type} from ${from} to ${to} metadata ${metadata}`,
                  {},
                  logger
                );
                updateConnectedMember({ metadata, type, from, to, origin });
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

          retryTimer = setInterval(() => {
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
  });
};
