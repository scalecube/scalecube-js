// @flow
import { Observable } from 'rxjs6';
import { Member } from './Member';
import { Status } from './types';

export interface Cluster {

  constructor():void;
  /**
   * @returns unique Id of the cluster
   */
  id(): Promise<string>;

    /**
     * Metadata, this probably will change
     * Right now the metadata is design only to hold custom metadata
     * I am sure the cluster will need metadata of it's own
     * When we will get to the transport we can design first version of it
     * @param value (if metadata should be changed)
     * @returns Promise, that resolves with a current metadata of the cluster
     */
  metadata(value:any): Promise<any>;

    /**
     * Join other cluster, in case 1 node of a cluster joins 1 node of another cluster it will cause them to merge
     * @param cluster - RemoteCluster instance
     * @returns Promise, that resolves with a status
     */
  join(cluster:Cluster): Promise<Status>;

    /**
     * Send a message to the cluster the node is leaving the cluster and destroy the instance
     * @returns Promise, that resolves with a status
     */
  shutdown(): Promise<Status>;

    /**
     * List of cluster members
     * @returns Promise, that resolves with an array of members
     */
  members(): Promise<Member[]>;

  /**
   * Removes the member from a member list of the cluster
   * @param id - Id of a cluster that should be removed
   * @returns Promise, that resolves with a status
   */
  removeMember(id: string): Promise<Status>;
}
