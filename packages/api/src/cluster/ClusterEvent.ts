import { MemberEventType } from './index';

/**
 * @interface ClusterEvent
 * Notification from Cluster to the subscriber
 */
export interface ClusterEvent {
  /**
   * @property
   * 'ADDED' | 'REMOVED' | 'INIT'
   */
  type: MemberEventType;
  /**
   * @property
   * data that pass between members
   */
  items: any[];
  /**
   * @property
   * from which member the information arrived
   */
  from: string;
}
