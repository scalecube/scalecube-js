// @flow
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { Cluster } from "../api/Cluster";
import { MembershipEvent } from "../api/MembershiptEvent";
import { CreateLogicalClusterInternals } from "./LogicalClusterInternals";

const internals: WeakMap<Cluster, any> = new WeakMap();
const internal = (obj): any => new Proxy(internals.get(obj), {
  apply(target: any, thisArg, args) {
    return target && target(...args);
  }
});

const LogicalClusterInternals = new CreateLogicalClusterInternals(internal);
/**
 * This is logical scalecube-cluster meaning it's just working without lot's of real life cases
 */
export class LogicalCluster implements Cluster {
    myId: string;
    members$: Subject<any>;
    myMembers: { [string]: Cluster };
    myMetadata: any;

    constructor() {
      this.myId = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
      this.members$ = new Subject();
      this.myMembers = { [this.myId]: this };
      internals.set(this, new LogicalClusterInternals(this));
      internal(this).send(this, "add", {});
    }

    id(): string {
      return this.myId;
    }

    metadata(value: any): any {
      if (value) {
        this.myMetadata = value;
        this.members().forEach((member) => {
          internal(this).send(member, "change", value);
        });
      } else {
        return this.myMetadata;
      }
    }

    join(cluster: Cluster): void {

      internal(this).add(cluster.members());
      internal(cluster).add(this.members());
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
