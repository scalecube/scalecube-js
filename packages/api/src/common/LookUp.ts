import { Endpoint } from '.';

/**
 * @interface LookUp
 * The function that finds all the appropriate endpoints for a given criteria
 */
export type LookUp = (options: LookupOptions) => Endpoint[] | [];

/**
 * @interface LookupOptions
 * The criteria, that is used to get endpoints from a registry
 */
export interface LookupOptions {
  /**
   * @property
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
}
