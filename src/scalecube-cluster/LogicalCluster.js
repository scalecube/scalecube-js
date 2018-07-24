// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster} from './api/Cluster';
import {MembershipEvent} from './api/MembershiptEvent';
import type {Type} from "./api/MembershiptEvent";

/*interface LogicalClusterInternals {
    message(message: MembershipEvent): void;
    send(member: Cluster, type: Type, data: any): void;
    add(members: Cluster[]): void;
    remove(member: Cluster): void;
    call(obj: LogicalClusterInternalsImpl | Cluster, method: string, args: any[]) {
}*/
class LogicalClusterInternals{
    cluster: any;
    clusters: WeakMap<LogicalClusterInternals, Cluster>;
    internals: WeakMap<Cluster, LogicalClusterInternals>;

    constructor(cluster: Cluster){
        this.cluster = cluster;
        this.clusters = new WeakMap();
        this.internals = new WeakMap();
        this.clusters.set(this, cluster);
        this.internals.set(cluster, this);
    }

    call(obj: LogicalClusterInternals | Cluster, method: string, args: any[]) {
        let inst = {};
        if( obj instanceof LogicalClusterInternals ) {
            inst = this.clusters.get(obj);
        } else if( obj instanceof LogicalCluster ) {
            inst = this.internals.get((obj:Cluster));
        } else {
            return;
        }
        if( !inst ) {
            return;
        }
        //$FlowFixMe
        if( typeof inst[method] === 'function' ) {
            //$FlowFixMe
            return inst[method](...args);
        }
    }

    start(cluster: Cluster){
        this.cluster = cluster;
        this.clusters = new WeakMap();
        this.internals = new WeakMap();
        this.clusters.set(this, cluster);
        this.internals.set(cluster, this);
    }
    message(message: MembershipEvent): void {
        this.cluster.members$.next(message);
    }

    send(member: Cluster, type: Type, data: any): void {
        internal(member).message({
            type: type,
            id: member.id(),
            sender: this.cluster.id(),
            metadata: data
        });
    }

    add(members: Cluster[]): void {
        const self = this.cluster;
        const data = this.cluster.metadata();
        members.forEach(
        (member) => {
            if (!this.cluster.myMembers[member.id()]) {
                    this.cluster.myMembers[member.id()] = member;
                    internal(member).add([self]);
                    internal(this.cluster).send(member, 'add', data);
                    //member.internal.add([self])
                    // this.call(this, 'send', [member, 'add', data]);
                }
            }
        );
    }

    remove(member: Cluster): void {
        delete this.cluster.myMembers[member.id()];
        this.send(member, 'remove', {});
    }
}
// Let clusters: WeakMap<LogicalClusterInternals, Cluster>;
const internals: WeakMap<Cluster, LogicalClusterInternals> = new WeakMap();
const internal = (obj):any => new Proxy(internals.get(obj), {
    apply: function(target:any, thisArg, args) {
                return target && target(...args);
    }
});
/**
 * This is logical scalecube-scalecube-cluster meaning it's just working without lot's of real life cases
 */
export class LogicalCluster implements Cluster {
    myId: string;
    members$: Subject<any>;
    myMembers: { [string]: Cluster };
    myMetadata: any;

    constructor() {
        this.myId = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
        this.members$ = new Subject();
        this.myMembers = {[this.myId]: this};
        internals.set(this, new LogicalClusterInternals(this));
        internal(this).send(this, 'add', {});
    }

    // C
    id(): string {
        return this.myId;
    }

    metadata(value: any): any {
        if (value) {
            this.myMetadata = value;
            this.members().forEach((member) => {
                internal(this).send(member, 'change', value);
            });
        } else {
            return this.myMetadata;
        }
    }

    join(cluster: Cluster): void {

        internal(this).add(cluster.members());
        internal(cluster).add(this.members());
        //this.internal.call(cluster,'add', [this.members()]);
    }

    shutdown(): void {
        this.members().forEach(
            (member) => {
                internal(member).remove(this);
            }
        );
        delete this.myMembers;
        this.members$.complete();
        delete this.members$;
    }

    members(): Cluster[] {
        // $FlowFixMe
        return Object.values(this.myMembers);
    }

    listenMembership(): Observable<MembershipEvent> {
        return this.members$.asObservable();
    };
}