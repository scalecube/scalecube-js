// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster} from './Cluster';
import {MembershipEvent} from './MembershiptEvent';
import type {Type} from "./MembershiptEvent";
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
        this.send(this, 'add', {});

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


    /// internals
    message(message: MembershipEvent): void {
        this.members$.next(message);
    }

    send(member: Cluster, type: Type, data: any): void {
        member.message({
            type: type,
            id: member.id(),
            sender: this.id(),
            metadata: data
        });
    }

    add(members: Cluster[]): void {
        const self = this;
        const data = this.metadata();
        members.forEach(
            (member) => {
                if (!this.myMembers[member.id()]) {
                    this.myMembers[member.id()] = member;
                    member.add([self]);
                    this.send(member, 'add', data);
                }

            }
        );
    }

    remove(member: Cluster): void {
        delete this.myMembers[member.id()];
        this.send(member, 'remove', {});
    }
}