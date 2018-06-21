// @flow
import { ReplaySubject } from 'rxjs/ReplaySubject';
/**
 * This is logical cluster meaning it's just working without lot's of real life cases
 */
export class LogicalCluster implements Cluster {
  constructor() {
    this.myAddress = String(Date.now()) + String(Math.random()) + String(Math.random()) + String(Math.random());
    this.members$ = new Subject();
    this.myMembers = {[this.myAddress]: this};
    this.members$.next({
      type: 'add',
      address: this.myAddress,
      data: this
    });

  }

  address(){
    return this.myAddress;
  }

  metadata(value) {
    if (value) {
      this.myMetadata = value;
    } else {
      return this.myMetadata;
    }
  }

  add(members) {
    members.forEach(
      (member) => {
        if (!this.myMembers[ member.address() ]) {
          this.myMembers[member.address()] = member;
          member.add([this]);
          member.members$.next({
            type: 'add',
            address: this.address(),
            data: this
          });
        }

      }
    );
  }

  remove(member) {
    this.myMembers[member.address()] = {};
  }

  join(cluster) {
    this.add(cluster.members());
    cluster.add(this.members());
  }

  shutdown(){
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
  members() {
    return Object.values(this.myMembers);
  }

  listenMembership() {
    return this.members$;
  };
}