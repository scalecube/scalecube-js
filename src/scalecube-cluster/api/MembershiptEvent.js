// @flow
export type Type = 'add' | 'remove' | 'change';

/**
 * @interface MembershipEvent
 */
export interface MembershipEvent {
    /**
     * Type of event
     */
  type: Type;
    /**
     * the sender id
     */
  senderId?: string;
    /**
     * the member id this event related to
     */
  memberId: string;
    /**
     * metadata of the member, the metadata is not per message/event is per cluster instance
     */
  metadata: any;
}
