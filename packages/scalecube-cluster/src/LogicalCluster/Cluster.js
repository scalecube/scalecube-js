// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';
import {MembershipEvent} from '../api/MembershiptEvent';
import { CreateLogicalClusterInternals } from './LogicalClusterInternals';

export class Cluster implements ClusterInterface {
    clusterId: string;
    processId: string;
    membersUpdates$: Subject<any>;
    clusterMembers: { [string]: any };
    clusterMetadata: any;

    constructor({ processId, metadata }) {
      this.clusterId = Date.now();
      this.processId = processId;
      this.membersUpdates$ = new Subject();
      this.clusterMembers = {[this.clusterId]: { clusterId: this.clusterId, processId: this.processId }};
      this.clusterMetadata = metadata;

      process.on('message', (data) => {
         if (data.command === 'join') {
           this.join(data.data);
         }
        if (data.command === 'addMembers') {
          this.join(data.data);
        }
      });
    }

    id(): string {

    }

    metadata(value: any): any {

    }

    join({ clusterId, processId, members }): void {
      this.clusterMembers = Object.assign({}, this.clusterMembers, members);
      process.send({
        command: 'addMembers',
        data: {
          clusterId,
          processId,
          members: this.clusterMembers
        }
      });
    }

    shutdown(): void {

    }

    members(): Cluster[] {

    }

    listenMembership(): Observable<MembershipEvent> {

    };
}
