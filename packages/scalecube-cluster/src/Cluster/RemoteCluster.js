// @flow
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Cluster as ClusterInterface } from '../api/Cluster';
import { MembershipEvent } from '../api/MembershiptEvent';
import { ClusterTransport } from '../Transport';

export class RemoteCluster implements ClusterInterface {
  constructor() {
    this.messages$ = new Subject();
  }

  id(): string {
    return this._send('id');
  }

  metadata(value: any): any {
    return this._send('metadata', value);
  }

  async join(cluster: ClusterInterface): void {
    const id = await cluster.id();
    return this._send('join', { id });
  }

  members() {
    return this._send('members');
  }

  removeMember(id) {
    return this._send('_removeMember', id);
  }

  shutdown() {
    return this._send('shutdown');
  }

  listenMembership(): Observable<MembershipEvent> {
    return this.messages$;
  };

  _send(path, args) {
    return this.myTransport.invoke(path, args);
  }

  transport(transportConfig) {
    this.myTransport = new ClusterTransport(transportConfig, this.messages$);
  }
}
