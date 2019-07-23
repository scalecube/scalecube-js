import { Address, ClusterApi } from '@scalecube/api';
import { ReplaySubject } from 'rxjs';

/**
 * @interface CreateClusterServer
 * factory for creating cluster server
 */
export type CreateClusterServer = (options: ClusterServerOptions) => ClusterServer;

/**
 * @interface ClusterServer
 * ClusterServer instance
 */
export interface ClusterServer {
  /**
   * @method
   * start listening
   */
  start: () => void;
  /**
   * @method
   * stop listening
   */
  stop: () => Promise<string>;
}

/**
 * @interface ClusterServerOptions
 * configuration for creating cluster server
 */
export interface ClusterServerOptions {
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
  rSubjectMembers: ReplaySubject<ClusterApi.ClusterEvent>;
  /**
   * @property
   * cluster member state
   */
  membersStatus: ClusterApi.MembersMap;
  /**
   * @method
   * update all connected members on any change
   */
  updateConnectedMember: (...data: any[]) => any;
  /**
   * @property
   * port1 is used for sending data to the seed
   */
  port1: MessagePort;
  /**
   * @property
   * member's seed address as string
   */
  seed?: string;
  /**
   * @method
   * factory for building membership event
   */
  getMembershipEvent: (...data: any[]) => any;
  /**
   * @property
   * debug
   */
  debug?: boolean;
}

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
  rSubjectMembers: ReplaySubject<ClusterApi.ClusterEvent>;
  /**
   * @property
   * cluster member state
   */
  membersStatus: ClusterApi.MembersMap;
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
