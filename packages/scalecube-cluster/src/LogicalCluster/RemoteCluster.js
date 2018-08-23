// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';

class clusterTransport {
  config;

  constructor(transportConfig) {
    this.config = transportConfig;
  }

  _getMsg(correlationId) {
    return new Promise((resolve) => {
      this.config.me.on('message', ({data}) => {
        if (data.correlationId === correlationId && data.clusterId === this.config.clusterId && !!data.response) {
          resolve(data.response);
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
  constructor() {
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

  _send(path, args) {
    return this.myTransport.invoke(path, args);
  }

  transport(transportConfig) {
    this.myTransport = new clusterTransport(transportConfig);
  }

}
