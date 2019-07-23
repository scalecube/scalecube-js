export const MEMBERSHIP_EVENT = 'membershipEvent';
export const MEMBERSHIP_EVENT_INIT_SERVER = 'membershipEventInitServer';
export const MEMBERSHIP_EVENT_INIT_CLIENT = 'membershipEventInitClient';
export const MESSAGE = 'message';
export const ADDED = 'ADDED';
export const REMOVED = 'REMOVED';
export const INIT = 'INIT';

export const getMultiInitClientFromServer = (whoAmI: string, from: string) => `PLEASE PAY ATTENTION:
            ${whoAmI} received multiple ${MEMBERSHIP_EVENT_INIT_CLIENT} from ${from},        
            it might happen if the addresses are not unique. and might result with incorrect behavior
            `;
