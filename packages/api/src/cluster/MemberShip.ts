export type MemberEventType = 'ADDED' | 'REMOVED' | 'INIT';

export interface MembershipEvent {
  /**
   * @method
   * the previous member the event arrived from
   */
  from: string;
  /**
   * @method
   * the next member the event need to be send to
   */
  to: string;
  /**
   * @method
   * metadata of the event
   */
  metadata: any;
  /**
   * @method
   * the original member that initiate the event
   */
  origin: string;
  /**
   * @method
   * the type of the event
   */
  type: MemberEventType;
}
