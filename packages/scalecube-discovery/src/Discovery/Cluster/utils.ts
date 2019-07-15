import { MemberEventType, MembershipEvent, MembersMap } from '../../helpers/types';

export const MEMBERSHIP_EVENT = 'membershipEvent';
export const MEMBERSHIP_EVENT_INIT_SERVER = 'membershipEventInitServer';
export const MEMBERSHIP_EVENT_INIT_CLIENT = 'membershipEventInitClient';
export const MESSAGE = 'message';
export const ADDED = 'ADDED';
export const REMOVED = 'REMOVED';
export const INIT = 'INIT';

export const getKeysAsArray = (obj: {}) => (obj && Object.keys(obj)) || [];

export const utils = (whoAmI: string, membersStatus: MembersMap) => {
  const getMembershipEvent = ({ from, to, metadata, origin, type }: MembershipEvent) => ({
    detail: {
      metadata,
      type,
      from,
      origin,
      to,
    },
    type: MEMBERSHIP_EVENT,
  });

  return {
    getMembershipEvent,
    updateConnectedMember: ({
      type,
      metadata,
      from,
      to,
      origin,
    }: {
      from: string;
      to: string;
      origin: string;
      metadata: any;
      type: MemberEventType;
    }) => {
      const { membersPort } = membersStatus;

      Object.keys(membersPort).forEach((nextMember: string) => {
        if (from !== nextMember && whoAmI !== nextMember && origin !== nextMember) {
          const mPort: MessagePort = membersPort[nextMember];
          mPort.postMessage(
            getMembershipEvent({
              from: whoAmI,
              to: nextMember,
              origin: from,
              metadata,
              type,
            })
          );
        }
      });
    },
  };
};

export const saveToLogs = (
  msg: string,
  extra: { [key: string]: any },
  logger?: { namespace: string },
  debug?: boolean
) => {
  const state = {
    msg,
    ...extra,
  };

  if (logger && logger.namespace) {
    // @ts-ignore
    window[namespace] = window[namespace] || {};
    // @ts-ignore
    window[namespace].cluster = window[namespace].cluster || [];

    // @ts-ignore
    logger && window.scalecube.cluster.push(state);
  }

  // tslint:disable
  debug && extra && extra.membersState && console.log(msg, 'membersState: ', extra.membersState);
  debug && extra && extra.membersPort && console.log(msg, 'membersPort: ', getKeysAsArray(extra.membersPort));
  // tslint:enable
};

export const genericPostMessage = (data: any, transfer?: any[]) => {
  try {
    // @ts-ignore
    if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
      // @ts-ignore
      postMessage(data, transfer ? transfer : undefined);
      const event = new MessageEvent('message', {
        data,
        ports: transfer ? transfer : undefined,
      });
      dispatchEvent(event);
    } else {
      postMessage(data, '*', transfer ? transfer : undefined);
    }
  } catch (e) {
    console.error('Unable to post message ', e);
  }
};
