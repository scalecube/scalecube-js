// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';
import {MembershipEvent} from '../api/MembershiptEvent';

export class LocalCluster implements ClusterInterface {
    clusterId: string;
    processId: string;
    membersUpdates$: Subject<any>;
    clusterMembers: { [string]: any };
    clusterMetadata: any;

    constructor() {
      this.clusterId = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
      this.membersUpdates$ = new Subject();
      this.clusterMembers = { [this.clusterId]: this};
    }
    _server(msg){
        console.error(msg);

        if(msg && this[msg.path]) {
            postMessage({
                correlationId: msg.correlationId,
                data: this[msg.path](msg.args)
            });
        }

    }

    eventBus(registerCB){
        registerCB(this._server());
    }

    id(): string {
        return this.clusterId;
    }

    metadata(value: any): any {
        if (value) {
            this.clusterMetadata = value;
        } else {
            return this.clusterMetadata;
        }
    }

    join(cluster: ClusterInterface): void {
      // TBD
        if( cluster.members().then ){
            cluster.members().then((m)=>this._add(m))
        } else {
            this._add(cluster.members());
        }
        //this.members().forEach(member=>member.id() !== this.id() && cluster.join(member));
    }
    _add(members: LocalCluster[]): void {
        const self = this;
        members.forEach(
            (member) => {
                if (!self.clusterMembers[member.id()] && self.id() !== member.id()) {
                    self.clusterMembers[member.id()] = member;
                    member.join(self);
                }
            }
        );
    }

    shutdown(): void {

    }

    members(): LocalCluster[] {
        return Object.values(this.clusterMembers);
    }

    listenMembership(): Observable<MembershipEvent> {

    };
}
