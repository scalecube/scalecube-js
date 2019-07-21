export type MemberEventType = 'ADDED' | 'REMOVED' | 'INIT' | 'CLOSE';

export interface MembershipEvent {
  /**
   * the previous member the event arrived from
   */
  from: string;
  /**
   * the next member the event need to be send to
   */
  to: string;
  /**
   * metadata of the event
   */
  metadata: any;
  /**
   * the original member that initiate the event
   */
  origin: string;
  /**
   * the type of the event
   */
  type: MemberEventType;
}
