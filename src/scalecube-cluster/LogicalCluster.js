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
    myAddress: string;
    members$: Subject<any>;
    myMembers: { [string]: Cluster };
    myMetadata: any;

    constructor() {
        this.myAddress = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
        this.members$ = new Subject();
        this.myMembers = {[this.myAddress]: this};
        this.send(this, 'add', {});

    }

    address(): string {
        return this.myAddress;
    }

    metadata(value: any): any {
        if (value) {
            this.myMetadata = value;
            const self = this;
            this.members().forEach((member) => {
                this.send(member, 'change', value);
            });
        } else {
            return this.myMetadata;
        }
    }

    message(message: MembershipEvent): void {
        this.members$.next(message);
    }

    send(member: Cluster, type: Type, data: any): void {
        member.message({
            type: type,
            address: member.address(),
            sender: this.address(),
            metadata: data
        });
    }

    add(members: Cluster[]): void {
        const self = this;
        const data = this.metadata();
        members.forEach(
            (member) => {
                if (!this.myMembers[member.address()]) {
                    this.myMembers[member.address()] = member;
                    member.add([self]);
                    this.send(member, 'add', data);
                }

            }
        );
    }

    remove(member: Cluster): void {
        delete this.myMembers[member.address()];
        this.send(member, 'remove', {});
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

    //leave(): Promise<'success'|'fail'>;
    members(): Cluster[] {
        // $FlowFixMe
        return Object.values(this.myMembers);
    }

    listenMembership(): Observable<MembershipEvent> {
        return this.members$.asObservable();
    };
}