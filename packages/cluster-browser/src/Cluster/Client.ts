import { getFullAddress, saveToLogs } from '@scalecube/utils';
import {
  MEMBERSHIP_EVENT,
  INIT,
  MESSAGE,
  REMOVED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
  ADDED,
  getMultiInitClientFromServer,
} from '../helpers/constants';
import { genericPostMessage, getKeysAsArray } from '../helpers/utils';
import { ClusterClientOptions, CreateClusterClient } from '../helpers/types';

export const client: CreateClusterClient = (options: ClusterClientOptions) => {
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
  let countServers = 0;
  const eventHandlers = {
    // tslint:disable-next-line
    [`globalEventsHandler${whoAmI}`]: function(ev: any) {
      const { type: evType, detail: membershipEvent } = ev.data;
      if (evType === MEMBERSHIP_EVENT_INIT_CLIENT) {
        const { from, origin } = membershipEvent;
        if (from === seed && origin && origin === whoAmI) {
          countServers++;

          if (countServers > 1) {
            console.warn(getMultiInitClientFromServer(whoAmI, from));
            return;
          }

          // @ts-ignore
          port1.addEventListener(MESSAGE, eventHandlers[`portEventsHandler${whoAmI}`].bind(this));
          port1.start();

          clearInterval(retryTimer);
          removeEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`]);
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
    },
    // tslint:disable-next-line
    [`portEventsHandler${whoAmI}`]: function(ev: any) {
      const { type: evType, detail: membershipEvent } = ev.data;
      if (evType === MEMBERSHIP_EVENT) {
        const { metadata, type, from, to, origin } = membershipEvent;

        if (origin === whoAmI || from === whoAmI || from === to) {
          return;
        }

        switch (type) {
          case INIT:
            clearInterval(retryTimer);
            removeEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`]);
            retryTimer = null;
            membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
            // @ts-ignore
            this.resolveClusterStart ? this.resolveClusterStart() : console.error('unable to resolve cluster client.');
            break;

          case ADDED:
            membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
            break;
          case REMOVED:
            if (membersStatus.membersState[from]) {
              delete membersStatus.membersState[from];
            }

            break;
        }

        updateConnectedMember({ metadata, type: type === INIT ? ADDED : type, from, to, origin });

        saveToLogs(
          whoAmI,
          `${whoAmI} client received ${type} request from ${from}`,
          {
            membersState: { ...membersStatus.membersState },
            membersPort: getKeysAsArray({ ...membersStatus.membersPort }),
          },
          debug
        );

        Object.keys(metadata).forEach(
          (member: string) =>
            rSubjectMembers &&
            rSubjectMembers.next({
              type,
              items: metadata[member],
              from: member,
            })
        );
      }
    },
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

          addEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`].bind(ClusterStart()));

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

      removeEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`]);
      port1.removeEventListener(MESSAGE, eventHandlers[`portEventsHandler${whoAmI}`]);
      port1.close();
      port2.close();
      saveToLogs(
        whoAmI,
        `${whoAmI} close client`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: getKeysAsArray({ ...membersStatus.membersPort }),
        },
        debug
      );
    },
  });
};
