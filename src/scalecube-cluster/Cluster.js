// @flow
import { Observable } from 'rxjs/Observable';
import { MembershipEvent } from './MembershiptEvent';
import type { Type } from "./MembershiptEvent";

export interface Cluster {
  address(): string;
  metadata(value:any): any;
  send(member:Cluster, type: Type, data: any):void;
  add(members:Cluster[]):void;
  remove(member:Cluster):void;
  join(cluster:Cluster): Promise<'success'|'fail'>|void;
  shutdown(): Promise<'success'|'fail'>|void;
  members(): Cluster[];
  listenMembership(): Observable<MembershipEvent>;
  message(message: MembershipEvent): void;
}