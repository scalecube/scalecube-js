import { Address } from '..';
import { ClusterEvent, MembersData } from './index';
import { Observable } from 'rxjs';

/**
 * @function JoinCluster
 * factory for creating a cluster instance
 */
export type JoinCluster = (options: ClusterOptions) => Cluster;

/**
 * @interface ClusterOptions
 */
export interface ClusterOptions {
  /**
   * @property address
   * address of the member
   */
  address: Address;
  /**
   * @property seedAddress
   * address of the member that act as the seed
   */
  seedAddress?: Address;
  /**
   * @property itemsToPublish
   * item to share with the different members
   */
  itemsToPublish: any;
  /**
   * @property retry
   * retry configuration for connecting members
   */
  retry?: {
    timeout: number;
  };
  /**
   * @property debug
   */
  debug?: boolean;
}

/**
 * @interface Cluster
 */
export interface Cluster {
  /**
   * @property getCurrentMemberStates
   * resolve with the current information of the other members in the distributed environment
   */
  getCurrentMembersData: () => Promise<MembersData>;
  /**
   * @property listen$
   * subscribe to changes in the members state
   */
  listen$: () => Observable<ClusterEvent>;
  /**
   * @property destroy
   * resolve when cluster is destroyed
   */
  destroy: () => Promise<string>;
}
