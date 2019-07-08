import { Observable } from 'rxjs';
import { ClusterEvent } from '../Discovery/Cluster/JoinCluster';

export interface MembersMap {
  membersState: MembersData;
  membersPort: MembersPort;
}

export interface MembersData {
  [member: string]: any;
}

export interface MembersPort {
  [member: string]: MessagePort;
}

export type MemberEventType = 'ADDED' | 'REMOVED' | 'INIT' | 'CLOSE';

export interface MembershipEvent {
  /**
   * the previous node the event arrived from
   */
  from: string;
  /**
   * the next node the event need to be send to
   */
  to: string;
  /**
   * metadata of the event
   */
  metadata: any;
  /**
   * the original node that initiate the event
   */
  origin: string;
  /**
   * the type of the event
   */
  type: MemberEventType;
}

export interface Cluster {
  getCurrentMemberStates: () => Promise<MembersMap>;
  listen$: () => Observable<ClusterEvent>;
  destroy: () => Promise<string>;
}
