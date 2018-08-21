// @flow
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Cluster as ClusterInterface} from '../api/Cluster';

class clusterTransport{
    config;
    constructor(transportConfig){
        this.config = transportConfig;
    }

    _getMsg(correlationId) {
        return new Promise((resolve) => {
            this.config.me.onmessage((msg)=>{
                if( msg.correlationId = correlationId ){
                    resolve(msg.data);
                }
            });
        });
    }

    invoke(path, args){
        const correlationId = Math.random() + Date.now();
        this.config.worker.postMessage({
            correlationId,
            path,
            args
        }, 'http://localhost');

        return this._getMsg(correlationId);
    }
}

export class RemoteCluster implements ClusterInterface {
    clusterId: string;
    membersUpdates$: Subject<any>;
    clusterMembers: { [string]: any };
    clusterMetadata: any;

    constructor() {

    }

    id(): string {
        return this._send('id');
    }

    metadata(value: any): any {
        return this._send('meta', value);
    }

    join(cluster: ClusterInterface): void {
        return this._send('join', cluster);
    }

    members(): LocalCluster[] {
        return this._send('members');
    }

    _send(path, args){
        return this.myTransport.invoke(path, args);
    }
    transport(transportConfig){
        this.myTransport = new clusterTransport(transportConfig);
    }

}
