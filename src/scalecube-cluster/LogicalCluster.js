// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster} from './api/Cluster';
import {MembershipEvent} from './api/MembershiptEvent';
import type {Type} from "./api/MembershiptEvent";

interface LogicalClusterInternals {
    message(message: MembershipEvent): void;
    send(member: Cluster, type: Type, data: any): void;
    add(members: Cluster[]): void;
    remove(member: Cluster): void;
}
class LogicalClusterInternalsImpl{
    cluster: any;
    clusters: WeakMap<LogicalClusterInternals, Cluster>;
    internals: WeakMap<Cluster, LogicalClusterInternals>;

    constructor(cluster){
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
        const _member = this.internals.get(member);
        _member && _member.message({
            type: type,
            id: member.id(),
            sender: this.cluster.id(),
            metadata: data
        });
    }

    add(members: Cluster[]): void {
        const self = this;
        const data = this.cluster.metadata();
        members.forEach(
            (member) => {
                if (!this.cluster.myMembers[member.id()]) {
                    this.cluster.myMembers[member.id()] = member;
                    this.insts.get(member).add([self]);
                    this.insts.get(this).send(member, 'add', data);
                }
            }
        );
    }

    remove(member: Cluster): void {
        delete this.cluster.myMembers[member.id()];
        this.send(member, 'remove', {});
    }
}

/**
 * This is logical scalecube-scalecube-cluster meaning it's just working without lot's of real life cases
 */
export class LogicalCluster implements Cluster {
    myId: string;
    members$: Subject<any>;
    myMembers: { [string]: Cluster };
    myMetadata: any;
    internal: LogicalClusterInternals;

    constructor() {
        this.myId = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
        this.members$ = new Subject();
        this.myMembers = {[this.myId]: this};
        this.internal =  new LogicalClusterInternalsImpl(this);
        this.internal.send(this, 'add', {});
    }

    // Cluster impl

    id(): string {
        return this.myId;
    }

    metadata(value: any): any {
        if (value) {
            this.myMetadata = value;
            this.members().forEach((member) => {
                this.send(member, 'change', value);
            });
        } else {
            return this.myMetadata;
        }
    }

    join(cluster: Cluster): void {
        this.add(cluster.members());
        cluster.add(this.members());
    }

    shutdown(): void {
        this.members().forEach(
            (member) => {
                member.remove(this);
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