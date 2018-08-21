// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster} from '../api/Cluster';
import {MembershipEvent} from '../api/MembershiptEvent';
import { CreateLogicalClusterInternals } from './LogicalClusterInternals';
import { fork } from 'child_process';

export class Transport {
    processes: any;

     constructor() {
        this.processes = {};

        setTimeout(() => {
          this.processes.processA.send({
            command: 'join',
            data: {
              clusterId: 5,
              processId: 'processB',
              members: {
                [5]: { clusterId: 1, processId: 'processB' },
                [1]: { clusterId: 1, processId: 'processB' },
                [2]: { clusterId: 2, processId: 'processB' },
                [3]: { clusterId: 2, processId: 'processC' }
              }
            }
          });
        }, 2000);
    }

    addProcess({ id, path }) {
      this.processes[id] = fork(path);
      this.processes[id].on('message', ({ command, data }) => {
        if (data.command === 'join') {
          this.processes[data.processId].send(data);
        }
        if (data.command === 'addMembers') {
          console.log('WILL ADD MEMBERS TO CLUSTERB', data.data);
        }
      });
    }

}
