// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';
import {MembershipEvent} from "../api/MembershiptEvent";

class clusterTransport {
  config;

  constructor(transportConfig, messages$) {
    this.config = transportConfig;
    this.messages$ = messages$;
    this.config.me.on('messageToChanel', ({ data }) => {
      if (data.clusterId === this.config.clusterId) {
        this.messages$.next(data.message);
      }
    });
  }

  _getMsg(correlationId) {
    return new Promise((resolve) => {
      const handleResponse = ({ data }) => {
        if (data.correlationId === correlationId && data.clusterId === this.config.clusterId && !!data.response) {
          this.config.me.removeListener('requestResponse', handleResponse);
          resolve(data.response);
        }
      };
      this.config.me.on('requestResponse', handleResponse);
    });
  }

  invoke(path, args) {
    const correlationId = Math.random() + Date.now();
    this.config.worker.postMessage({
      eventType: 'requestResponse',
      correlationId,
      clusterId: this.config.clusterId,
      request: { path, args }
    });

    return this._getMsg(correlationId);
  }
}

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
    this.myTransport = new clusterTransport(transportConfig, this.messages$);
  }
}
