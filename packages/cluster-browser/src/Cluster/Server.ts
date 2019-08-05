import { saveToLogs } from '@scalecube/utils';
import {
  MEMBERSHIP_EVENT,
  INIT,
  MESSAGE,
  REMOVED,
  ADDED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
  getMultiInitClientFromServer,
} from '../helpers/constants';
import { genericPostMessage, getKeysAsArray } from '../helpers/utils';
import { ClusterServerOptions, CreateClusterServer } from '../helpers/types';

export const server: CreateClusterServer = (options: ClusterServerOptions) => {
  const {
    whoAmI,
    itemsToPublish,
    rSubjectMembers,
    membersStatus,
    updateConnectedMember,
    getMembershipEvent,
    port1,
    seed,
    debug,
  } = options;
  const eventHandlers = {
    [`globalEventsHandler${whoAmI}`]: (ev: any) => {
      const { type: evType, detail: membershipEvent } = ev.data;
      if (evType === MEMBERSHIP_EVENT) {
        const { metadata, type, to, from, origin } = membershipEvent;

        if (origin === whoAmI || from === whoAmI || from === to || to !== whoAmI) {
          return;
        }

        if (membersStatus.membersState[origin]) {
          saveToLogs(whoAmI, getMultiInitClientFromServer(whoAmI, origin), {}, debug, 'warn');
          return;
        }

        // console.log('Server listen to global', { ...membersStatus.membersState },metadata, whoAmI)
        const mPort: MessagePort = ev && ev.ports && ev.ports[0];
        if (!mPort) {
          console.error(`${whoAmI} unable to receive port from ${from}`);
        }

        mPort.addEventListener(MESSAGE, eventHandlers[`portEventsHandler${whoAmI}`]);
        mPort.start();

        // 1. update seed with the new metadata
        seed &&
          port1.postMessage(
            getMembershipEvent({
              from: whoAmI,
              to: seed,
              origin,
              metadata,
              type: ADDED,
            })
          );

        // 2. response to initiator of the contact with all members data
        mPort.postMessage(
          getMembershipEvent({
            from: whoAmI,
            to: from,
            origin: whoAmI,
            metadata: { ...membersStatus.membersState, [whoAmI]: itemsToPublish },
            type: INIT,
          })
        );

        // 3. update membersState
        membersStatus.membersState = { ...membersStatus.membersState, ...metadata };
        updateConnectedMember({ metadata, type: ADDED, from, to, origin });
        // 4. update ports
        membersStatus.membersPort = { ...membersStatus.membersPort, [from]: mPort };

        rSubjectMembers &&
          rSubjectMembers.next({
            type,
            items: metadata[origin],
            from: origin,
          });

        saveToLogs(
          whoAmI,
          `${whoAmI} server received ${type} request from ${from}`,
          {
            membersState: { ...membersStatus.membersState },
            membersPort: getKeysAsArray({ ...membersStatus.membersPort }),
          },
          debug
        );
      }

      if (evType === MEMBERSHIP_EVENT_INIT_SERVER) {
        const { to, origin } = membershipEvent;
        if (to === whoAmI && to !== origin) {
          genericPostMessage({
            detail: {
              from: whoAmI,
              to: origin,
              origin,
            },
            type: MEMBERSHIP_EVENT_INIT_CLIENT,
          });
        }
      }
    },
    [`portEventsHandler${whoAmI}`]: (ev: any) => {
      const { type: evType, detail: membershipEvent } = ev.data;
      const { metadata, type, from, to, origin } = membershipEvent;

      if (origin === whoAmI || from === whoAmI || to !== whoAmI) {
        return;
      }

      // update seed with the change in members
      seed &&
        port1.postMessage(
          getMembershipEvent({
            from: whoAmI,
            to: seed,
            origin,
            metadata,
            type,
          })
        );

      switch (type) {
        case INIT:
          break;
        case ADDED:
          membersStatus.membersState = { ...membersStatus.membersState, ...metadata };

          break;
        case REMOVED:
          if (membersStatus.membersState[origin]) {
            delete membersStatus.membersState[origin];
          }

          const mPort = membersStatus.membersPort[origin];
          if (mPort) {
            mPort.postMessage(
              getMembershipEvent({
                type: REMOVED,
                metadata: {},
                to: from,
                from: to,
                origin: whoAmI,
              })
            );

            membersStatus.membersPort[origin].close();
          }

          break;
        default:
          saveToLogs(whoAmI, 'Not supported membership event type', {}, debug, 'warn');
          return;
      }

      rSubjectMembers &&
        rSubjectMembers.next({
          type,
          items: metadata[origin],
          from: origin,
        });

      updateConnectedMember({ metadata, type: type === INIT ? ADDED : type, from, to, origin });

      saveToLogs(
        whoAmI,
        `${whoAmI} server received ${type} request from ${from}`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: getKeysAsArray({ ...membersStatus.membersPort }),
        },
        debug
      );
    },
  };

  return {
    start: () => {
      addEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`]);

      genericPostMessage({
        detail: {
          whoAmI,
        },
        type: 'ConnectWorkerEvent',
      });
    },
    stop: () => {
      removeEventListener(MESSAGE, eventHandlers[`globalEventsHandler${whoAmI}`]);

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

        mPort.removeEventListener(MESSAGE, eventHandlers[`portEventsHandler${whoAmI}`]);
        mPort.close();
      });

      return Promise.resolve('');
    },
  };
};
