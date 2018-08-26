// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';
import {MembershipEvent} from "../api/MembershiptEvent";

class clusterTransport {
  config;

  constructor(transportConfig, messages$, first) {
    this.config = transportConfig;
    this.messages$ = messages$;
    this.first = first;
  }

  _getMsg(correlationId) {
    return new Promise((resolve) => {
      this.config.me.on('message', ({ data }) => {
        if (!!data.response && data.response.messageToId === this.config.clusterId && data.clusterId === this.config.clusterId) {
          data.response.timestamp = Date.now();
          this.messages$.next(data.response);
        } else {
          if (data.correlationId === correlationId && data.clusterId === this.config.clusterId && !!data.response) {
            // if (data.response.message) {
            //   console.log('going to emit with first', this.first);
            //   this.messages$.next(data.response);
            // }

            resolve(data.response);
          }
        }
      });
    });
  }

  invoke(path, args) {
    const correlationId = Math.random() + Date.now();
    this.config.worker.postMessage({
      correlationId,
      clusterId: this.config.clusterId,
      request: { path, args }
    }, 'http://localhost');

    return this._getMsg(correlationId);
  }
}

export class RemoteCluster implements ClusterInterface {
  constructor(first) {
    this.messages$ = new Subject();
    this.first = first;
    this.transportId = Date.now();


    // this.messages$.subscribe((data) => {
    //   console.log('this.messages$ in constructor', data);
    // });
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

  messageToChanel(messageRequest) {
    return this._send('messageToChanel', messageRequest);
  }

  listenMembership(): Observable<MembershipEvent> {
    // this.id().then(id => console.log('ID IN LISTEN', id));
    // this.id().then(id => console.log('ID IN LISTEN555', id));
    // this.id().then(id => console.log('ID IN LISTEN5557', id));
    return this.messages$;
  };

  _send(path, args) {
    return this.myTransport.invoke(path, args);
  }

  transport(transportConfig) {
    this.myTransport = new clusterTransport(transportConfig, this.messages$, this.first);
  }
}
