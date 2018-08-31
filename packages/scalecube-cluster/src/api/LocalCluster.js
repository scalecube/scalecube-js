// @flow
export interface LocalCluster {

  constructor():void;
  /**
   * @returns unique Id of the cluster
   */
  id(): any;
    /**
     * Metadata, this probably will change
     * Right now the metadata is design only to hold custom metadata
     * I am sure the cluster will need metadata of it's own
     * When we will get to the transport we can design first version of it
     * @param value
     */
  metadata(value:any): any;

    /**
     * Join other cluster, in case 1 node of a cluster join 1 node of another cluster it will cause them to merge
     * @param cluster
     */
  join(cluster:any): any;

    /**
     * Send a message to the cluster the node is leaving the cluster and destroy the instance
     */
  shutdown(): any;

    /**
     * list of cluster members
     * @return array of Cluster nodes
     */
  members(): any;
}
