// @flow
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Cluster as ClusterInterface } from '../api/Cluster';
import { MembershipEvent } from '../api/MembershiptEvent';
import { ClusterTransport } from '../Transport';
import { Member } from '../api/Member';
import { Request } from '../api/types';

export class RemoteCluster implements ClusterInterface {
  messages$: Subject;

  constructor() {
    this.messages$ = new Subject();
  }

  id(): Promise<string> {
    return this._send({ path: 'id' });
  }

  metadata(value: any): any {
    return this._send({ path: 'metadata', args: value });
  }

  async join(cluster: ClusterInterface): Promise<'success'|'fail'> {
    const id = await cluster.id();
    return this._send({ path: 'join', args: id });
  }

  members(): Promise<Member[]> {
    return this._send({ path: 'members' });
  }

  _removeMember(id: string): Promise<'success'> {
    return this._send({ path: '_removeMember', args: id });
  }

  shutdown(): Promise<'success'|'fail'> {
    return this._send({ path: 'shutdown' });
  }

  listenMembership(): Observable<MembershipEvent> {
    return this.messages$.asObservable();
  };

  _send(request: Request) {
    return this.myTransport.invoke(request);
  }

  transport(transportConfig) {
    this.myTransport = new ClusterTransport(transportConfig, this.messages$);
  }
}
