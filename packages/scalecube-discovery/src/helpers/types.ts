import { Observable } from 'rxjs';
import { ClusterEvent } from '../Discovery/Cluster/JoinCluster';

export interface MembersMap {
  membersState: {
    [member: string]: any;
  };
  membersPort: MembersPort;
}

export interface MembersPort {
  [member: string]: MessagePort;
}

export type MemberEventType = 'ADDED' | 'REMOVED' | 'INIT' | 'CLOSE';

export interface MembershipEvent {
  /**
   * address of the member
   */
  member: string;
  /**
   * status of the member
   */
  type: MemberEventType;
  /**
   * metadata of the member
   */
  metadata: MembersMap;
}

export type ConnectType = 'window' | 'port';

export interface Cluster {
  getCurrentMemberStates: () => Promise<MembersMap>;
  listen$: () => Observable<ClusterEvent>;
  destroy: () => Promise<string>;
}
