// @flow
import { Observable } from 'rxjs6';
import { Cluster } from './Cluster';
import { MembershipEvent } from './MembershiptEvent';

export interface RemoteCluster extends Cluster {
  /**
   * Listen to all membership events
   * @returns Observable of MembershipEvent
   */
  listenMembership(): Observable<MembershipEvent>;
}
