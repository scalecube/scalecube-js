// @flow
import { Subject, Observable } from 'rxjs6';
import { Cluster as ClusterInterface } from '../api/Cluster';
import { MembershipEvent } from '../api/MembershiptEvent';
import { ClusterTransport } from '../Transport';
import { Member } from '../api/Member';
import { Request } from '../api/types';
import { TransportConfig } from '../api/TransportConfig';

export class RemoteCluster implements ClusterInterface {
  messages$: Subject;
  transport: ClusterTransport;

  constructor() {
    this.messages$ = new Subject();
  }

  id(): Promise<string> {
    return this._send({ path: 'id' });
  }

  metadata(value: any): any {
    return this._send({ path: 'metadata', args: value });
  }

  async join(cluster: any): Promise<'success'|'fail'> {
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
    return this.transport.invoke(request);
  }

  transport(transportConfig: TransportConfig) {
    this.transport = new ClusterTransport(transportConfig, this.messages$);
  }
}
