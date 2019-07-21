import { ClusterApi } from '@scalecube/api';
import {
  MEMBERSHIP_EVENT,
  INIT,
  MESSAGE,
  REMOVED,
  ADDED,
  MEMBERSHIP_EVENT_INIT_SERVER,
  MEMBERSHIP_EVENT_INIT_CLIENT,
} from '../helpers/constants';
import { genericPostMessage, getKeysAsArray, saveToLogs } from '../helpers/utils';

export const server: ClusterApi.CreateClusterServer = (options: ClusterApi.ClusterServerOptions) => {
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
  const globalEventsHandler = (ev: any) => {
    const { type: evType, detail: membershipEvent } = ev.data;
    if (evType === MEMBERSHIP_EVENT) {
      const { metadata, type, to, from, origin } = membershipEvent;

      if (origin === whoAmI || from === whoAmI || from === to || to !== whoAmI) {
        return;
      }

      const mPort: MessagePort = ev && ev.ports && ev.ports[0];
      if (!mPort) {
        console.error(`Address collusion ${whoAmI} and ${from}`);
      }

      mPort.addEventListener(MESSAGE, portEventsHandler);
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
        `${whoAmI} server received ${type} request from ${from}`,
        {
          membersState: { ...membersStatus.membersState },
          membersPort: { ...membersStatus.membersPort },
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
  };

  const portEventsHandler = (ev: any) => {
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

        rSubjectMembers &&
          rSubjectMembers.next({
            type,
            items: metadata[origin],
            from: origin,
          });
        break;
      case REMOVED:
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

          rSubjectMembers &&
            rSubjectMembers.next({
              type,
              items: metadata[origin],
              from: origin,
            });
        }
        break;
      default:
        console.warn('Not supported membership event type');
        return;
    }

    updateConnectedMember({ metadata, type: type === INIT ? ADDED : type, from, to, origin });

    saveToLogs(
      `${whoAmI} server received ${type} request from ${from}`,
      {
        membersState: { ...membersStatus.membersState },
        membersPort: { ...membersStatus.membersPort },
      },
      debug
    );
  };

  return {
    start: () => {
      addEventListener(MESSAGE, globalEventsHandler);

      genericPostMessage({
        detail: {
          whoAmI,
        },
        type: 'ConnectWorkerEvent',
      });
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
