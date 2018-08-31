// @flow
import { Subject, Observable } from 'rxjs6';
import { RemoteCluster as ClusterInterface } from '../api/RemoteCluster';
import { MembershipEvent } from '../api/MembershiptEvent';
import { ClusterTransport } from '../Transport';
import { Member } from '../api/Member';
import { Request, Status } from '../api/types';
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

  metadata(value: any): Promise<any> {
    return this._send({ path: 'metadata', args: value });
  }

  async join(cluster: any): Promise<Status> {
    const id = await cluster.id();
    return this._send({ path: 'join', args: id });
  }

  members(): Promise<Member[]> {
    return this._send({ path: 'members' });
  }

  removeMember(id: string): Promise<Status> {
    return this._send({ path: 'removeMember', args: id });
  }

  shutdown(): Promise<Status> {
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
