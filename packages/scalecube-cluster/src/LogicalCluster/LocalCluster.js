// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';
import {MembershipEvent} from '../api/MembershiptEvent';
import {RemoteCluster} from "./RemoteCluster";
import type {Type} from "../api/MembershiptEvent";

const createRemoteCluster = (clusterId) => {
  const remoteCluster = new RemoteCluster();
  remoteCluster.transport({
    type: "PostMessage",
    worker: main,
    me: mainEventEmitter,
    clusterId
  });
  return remoteCluster;
};

const createRemoteClustersById = clusterIds => clusterIds.map(({ id }) => createRemoteCluster(id));

export class LocalCluster implements ClusterInterface {
  clusterId: string;
  processId: string;
  membersUpdates$: Subject<any>;
  clusterMembers: { [string]: any };
  clusterMetadata: any;

  constructor() {
    this.clusterId = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
    this.membersUpdates$ = new Subject();
    const remoteCluster = createRemoteCluster(this.clusterId);
    this.clusterMembers = { [this.clusterId]: remoteCluster };
  }

  async _server(msg) {
    if (msg && msg.request && this[msg.request.path]) {
      if (msg.clusterId === this.id()) {
        if (msg.request.path === 'join') {
          msg.request.args = createRemoteCluster(msg.request.args.id);
        }
        if (msg.request.path === 'messageToChanel') {
          // console.log('message msg.clusterId', msg.clusterId);
        }
        const response = await this[msg.request.path](msg.request.args);

        // if (response && response.message) { console.log('going to post to worker message', response.message); }
        main.postMessage({
          correlationId: msg.correlationId,
          clusterId: msg.clusterId,
          response
        });
      }
    }
  }

  eventBus(registerCB) {
    registerCB(this._server.bind(this));
  }

  id(): string {
    return this.clusterId;
  }

  metadata(value: any): any {
    if (value) {
      this.clusterMetadata = value;
      return Promise.resolve(true);
    } else {
      return Promise.resolve(this.clusterMetadata);
    }
  }

  async join(cluster: ClusterInterface): void {
    const members = await cluster.members();
    return this._add(createRemoteClustersById(members));
  }

  async _add(members: RemoteCluster[]): void {
    const iterations = members.map(
      async (member) => {
        const memberId = await member.id();
        if (!this.clusterMembers[memberId] && this.id() !== memberId) {
          this.clusterMembers[memberId] = member;
          await member.join(this);
          return Promise.resolve(true);
        }
        return Promise.resolve(true);
      }
    );
    return Promise.all(iterations);
  }

  messageToChanel(data) {
    return Promise.resolve(Object.assign({}, data, { messageToId: this.id() }));
  }

  shutdown(): void {
    Object.values(this.clusterMembers).forEach((remoteCluster) => {
        remoteCluster.messageToChanel({
          type: 'remove',
          memberId: this.id(),
          senderId: this.id(),
          data: {}
        });
    });
  }

  members(): LocalCluster[] {
    const clusterMembers = Object.values(this.clusterMembers);
    const members = clusterMembers.map(async cluster => {
      const id = await cluster.id();
      const metadata = await cluster.metadata();
      return { id, metadata };
    });
    return Promise.all(members);
  }
}
