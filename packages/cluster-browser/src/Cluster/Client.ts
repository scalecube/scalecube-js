import { ClusterApi } from '@scalecube/api';
import { getFullAddress } from '@scalecube/utils';
import {
  MEMBERSHIP_EVENT,
  INIT,
  MESSAGE,
  REMOVED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
  ADDED,
} from '../helpers/constants';
import { genericPostMessage, saveToLogs } from '../helpers/utils';

export const client: ClusterApi.CreateClusterClient = (options: ClusterApi.ClusterClientOptions) => {
  const {
    whoAmI,
    membersStatus,
    updateConnectedMember,
    getMembershipEvent,
    itemsToPublish,
    rSubjectMembers,
    port1,
    port2,
    debug,
    retry,
    seedAddress,
  } = options;

  let seed = '';
  let retryTimer: any = null;

  const portEventsHandler = function(ev: any) {
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
        // @ts-ignore
        this.resolveClusterStart ? this.resolveClusterStart() : console.error('unable to resolve cluster client.');
      }

      membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
      updateConnectedMember({ metadata, type: type === INIT ? ADDED : type, from, to, origin });

      saveToLogs(
        `${whoAmI} client received ${type} request from ${from}`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
        },
        debug
      );

      Object.keys(metadata).forEach((member: string) => {
        rSubjectMembers &&
          rSubjectMembers.next({
            type,
            items: metadata[member],
            from: member,
          });
      });
    }
  };

  const globalEventsHandler = function(ev: any) {
    const { type: evType, detail: membershipEvent } = ev.data;
    if (evType === MEMBERSHIP_EVENT_INIT_CLIENT) {
      const { from, origin } = membershipEvent;
      if (from === seed && origin && origin === whoAmI) {
        // @ts-ignore
        port1.addEventListener(MESSAGE, portEventsHandler.bind(this));
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

  return Object.freeze({
    start: () =>
      new Promise((resolve, reject) => {
        if (!seedAddress) {
          resolve();
        } else {
          seed = getFullAddress(seedAddress);

          const ClusterStart = () => ({
            resolveClusterStart: resolve,
          });

          addEventListener(MESSAGE, globalEventsHandler.bind(ClusterStart()));

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
        debug
      );
    },
  });
};
