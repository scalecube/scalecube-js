// @flow
interface Cluster {
  address(): Number;
  join(): Promise<'success'|'fail'>;
  shutdown(): Promise<'success'|'fail'>;
  members(): Member[];
  listenMembership(): Observable<MembershipEvent>;
}