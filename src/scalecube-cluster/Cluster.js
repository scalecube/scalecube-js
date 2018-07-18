// @flow
import { Observable } from 'rxjs/Observable';
import { MembershipEvent } from './MembershiptEvent';
import { ClusterOptions } from "./ClusterOptions";

export interface Cluster {
  constructor(options:ClusterOptions|void):void;
  id(): string;
  metadata(value:any): any;
  join(cluster:Cluster): Promise<'success'|'fail'>|void;
  shutdown(): Promise<'success'|'fail'>|void;
  members(): Cluster[];
  listenMembership(): Observable<MembershipEvent>;
}