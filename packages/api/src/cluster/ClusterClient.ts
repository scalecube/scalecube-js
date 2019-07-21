import { ReplaySubject } from 'rxjs';
import { ClusterEvent, MembersMap } from './index';
import { Address } from '../index';

/**
 * @interface CreateClusterClient
 * factory for creating cluster client
 */
export type CreateClusterClient = (options: ClusterClientOptions) => ClusterClient;

/**
 * @interface ClusterClient
 * ClusterClient instance
 */
export interface ClusterClient {
  /**
   * @method
   * start try to connect to seed
   */
  start: () => Promise<any>;
  /**
   * @method
   * stop & destroy member
   */
  stop: () => void;
}

/**
 * @interface ClusterClientOptions
 * configuration for creating cluster client
 */
export interface ClusterClientOptions {
  /**
   * @property
   * current member
   */
  whoAmI: string;
  /**
   * @property
   * current member data
   */
  itemsToPublish: any[];
  /**
   * @property
   * replay subject for update subscribers
   */
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  /**
   * @property
   * cluster member state
   */
  membersStatus: MembersMap;
  /**
   * @property
   * port1 is used for sending data to the seed
   */
  port1: MessagePort;
  /**
   * @property
   * port2 is used for return data from the seed
   */
  port2: MessagePort;
  /**
   * @method
   * update all connected members on any change
   */
  updateConnectedMember: (...data: any[]) => any;
  /**
   * @method
   * factory for building membership event
   */
  getMembershipEvent: (...data: any[]) => any;
  /**
   * @method
   * configure retry until establish connection with the seed
   */
  retry: {
    timeout: number;
  };
  /**
   * @property
   * member's seed address as Address
   */
  seedAddress: Address | void;
  /**
   * @property
   * debug
   */
  debug?: boolean;
}
