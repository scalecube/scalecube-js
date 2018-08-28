// @flow
import { Cluster as ClusterInterface } from '../api/Cluster';
import { RemoteCluster } from './RemoteCluster';
import { eventTypes, messageTypes } from '../helpers/const';
import { createId, createRemoteCluster, createRemoteClustersById, formatSuccessResponse } from '../helpers/utils';
import { Message } from '../api/types';
import { MembershipEvent } from '../api/MembershiptEvent';
import { Member } from '../api/Member';

export class LocalCluster {
  clusterId: string;
  clusterMembers: { [string]: ClusterInterface };
  clusterMetadata: any;

  constructor() {
    this.clusterId = createId();
    this.clusterMembers = { [this.clusterId]: createRemoteCluster(this.clusterId) };
    this._server = this._server.bind(this);
  }

  async _server(msg: Message) {
    if (msg && msg.request && this[msg.request.path]) {
      const currentClusterId = await this.id();
      if (msg.clusterId === currentClusterId) {
        if (msg.request.path === 'join') {
          msg.request.args = createRemoteCluster(msg.request.args);
        }

        const response = await this[msg.request.path](msg.request.args);
        main.postMessage({
          eventType: eventTypes.requestResponse,
          correlationId: msg.correlationId,
          clusterId: msg.clusterId,
          response
        });
      }
    }
  }

  eventBus(registerCB: any) {
    registerCB(this._server);
  }

  id(): Promise<string> {
    return Promise.resolve(this.clusterId);
  }

  metadata(value: any): any {
    if (value) {
      this.clusterMetadata = value;

      return Promise.all(Object.values(this.clusterMembers).map(async (remoteCluster) => {
        const clusterId = await remoteCluster.id();
        const currentClusterId = await this.id();
        this._messageToChanel(clusterId, {
          type: messageTypes.change,
          memberId: currentClusterId,
          senderId: currentClusterId,
          metadata: value
        });
      })).then(formatSuccessResponse);
    } else {
      return Promise.resolve(this.clusterMetadata);
    }
  }

  async join(cluster: ClusterInterface): Promise<'success'|'fail'> {
    const members = await cluster.members();
    return this._add(createRemoteClustersById(members)).then(formatSuccessResponse);
  }

  async _add(members: RemoteCluster[]): Promise<void>[] {
    return Promise.all(members.map(async (member) => {
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
    main.postMessage({
      eventType: eventTypes.message,
      clusterId,
      message
    });
  }

  shutdown(): Promise<'success'|'fail'> {
    return Promise.all(Object.values(this.clusterMembers).map(async(remoteCluster) => {
      const currentClusterId = await this.id();
      await remoteCluster._removeMember(currentClusterId);

      const clusterId = await remoteCluster.id();
      this._messageToChanel(clusterId, {
        type: messageTypes.remove,
        memberId: currentClusterId,
        senderId: currentClusterId,
        metadata: {}
      });
    })).then(formatSuccessResponse);
  }

  _removeMember(id: string) {
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
    return Promise.all(clusterMembers.map(async cluster => {
      const id = await cluster.id();
      const metadata = await cluster.metadata();
      return { id, metadata };
    }));
  }
}
