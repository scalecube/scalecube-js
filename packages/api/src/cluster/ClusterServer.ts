import { ClusterEvent, MembersMap } from './index';
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
  rSubjectMembers: ReplaySubject<ClusterEvent>;
  /**
   * @property
   * cluster member state
   */
  membersStatus: MembersMap;
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
