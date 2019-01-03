import { MembershipEvent, Type } from "../api/MembershiptEvent";
import { Cluster } from "../api/Cluster";

export const CreateLogicalClusterInternals = (internal) => class LogicalClusterInternals{
    cluster: any;

    constructor(cluster: Cluster){
        this.cluster = cluster;
    }

    message(message: MembershipEvent): void {
        this.cluster.members$.next(message);
    }

    send(member: Cluster, type: Type, data: any): void {
        internal(member).message({
            type: type,
            memberId: this.cluster.id(),
            senderId: this.cluster.id(),
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
                    internal(this.cluster).send(member, "add", data);
                }
            }
        );
    }

    remove(member: Cluster): void {
        delete this.cluster.myMembers[member.id()];
        this.send(member, "remove", {});
    }
};
