// @flow
import { RemoteCluster as ClusterInterface } from '../api/RemoteCluster';
import { Cluster as LocalClusterInterface } from '../api/Cluster';
import { RemoteCluster } from './RemoteCluster';
import { eventTypes, messageTypes } from '../helpers/const';
import { createId, createRemoteCluster, createRemoteClustersById, formatSuccessResponse } from '../helpers/utils';
import { Message, Status } from '../api/types';
import { MembershipEvent } from '../api/MembershiptEvent';
import { Member } from '../api/Member';

export class LocalCluster implements LocalClusterInterface {
  clusterId: string;
  clusterMembers: { [string]: ClusterInterface };
  clusterMetadata: any;

  constructor() {
    this.clusterId = createId();
    this.clusterMembers = { [this.clusterId]: createRemoteCluster(this.clusterId) };
  }

  _server = async (msg: Message) => {
    const currentLocalCluster: Object = this;
    if (msg && msg.request && currentLocalCluster[msg.request.path]) {
      const currentClusterId = await currentLocalCluster.id();
      if (msg.clusterId === currentClusterId) {
        if (msg.request.path === 'join') {
          msg.request.args = createRemoteCluster(msg.request.args);
        }

        const response = await currentLocalCluster[msg.request.path](msg.request.args);
        global.main.postMessage({
          eventType: eventTypes.requestResponse,
          correlationId: msg.correlationId,
          clusterId: msg.clusterId,
          response
        });
      }
    }
  }

  eventBus(registerCB: any): void {
    registerCB(this._server);
  }

  id(): Promise<string> {
    return Promise.resolve(this.clusterId);
  }

  metadata(value: any): Promise<any> {
    if (value) {
      this.clusterMetadata = value;

      return Promise.all(Object.values(this.clusterMembers).map(async (remoteCluster: any) => {
        const clusterId = await remoteCluster.id();
        const currentClusterId = await this.id();
        this._messageToChanel(clusterId, {
          type: messageTypes.change,
          memberId: currentClusterId,
          senderId: currentClusterId,
          metadata: value
        });
      })).then(() => this.clusterMetadata);
    } else {
      return Promise.resolve(this.clusterMetadata);
    }
  }

  async join(cluster: any): Promise<Status> {
    const members = await cluster.members();
    return this._add(createRemoteClustersById(members)).then(formatSuccessResponse);
  }

  async _add(members: RemoteCluster[]): Promise<void[]> {
    return Promise.all(members.map(async (member: RemoteCluster) => {
        const memberId = await member.id();
        const metadata = await this.metadata();
        const currentClusterId = await this.id();
        if (!this.clusterMembers[memberId] && currentClusterId !== memberId) {
          this.clusterMembers[memberId] = member;
          await member.join(this);

          this._messageToChanel(memberId, {
            type: messageTypes.add,
            memberId: currentClusterId,
            senderId: currentClusterId,
            metadata
          });

          return Promise.resolve();
        }
        return Promise.resolve();
      }
    ));
  }

  _messageToChanel(clusterId: string, message: MembershipEvent) {
    global.main.postMessage({
      eventType: eventTypes.message,
      clusterId,
      message
    });
  }

  shutdown(): Promise<Status> {
    return Promise.all(Object.values(this.clusterMembers).map(async (remoteCluster: any) => {
      const currentClusterId = await this.id();
      await remoteCluster.removeMember(currentClusterId);

      const clusterId = await remoteCluster.id();
      this._messageToChanel(clusterId, {
        type: messageTypes.remove,
        memberId: currentClusterId,
        senderId: currentClusterId,
        metadata: {}
      });
    })).then(formatSuccessResponse);
  }

  removeMember(id: string): Promise<Status> {
    this.clusterMembers = Object.keys(this.clusterMembers).reduce((members, clusterId) => {
      if (clusterId !== id) {
        members[clusterId] = this.clusterMembers[clusterId];
      }
      return members;
    }, {});

    return Promise.resolve('success');
  }

  members(): Promise<Member[]> {
    const clusterMembers = Object.values(this.clusterMembers);
    return Promise.all(clusterMembers.map(async (cluster: any) => {
      const id = await cluster.id();
      const metadata = await cluster.metadata();
      return { id, metadata };
    }));
  }
}
