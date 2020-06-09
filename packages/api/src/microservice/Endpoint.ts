import { Address } from '..';
import { AsyncModel } from '.';

/**
 * @interface Endpoint
 * Defines remote service data
 */
export interface Endpoint {
  /**
   * @property
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * property
   * The name of a service, that is provided in serviceDefinition
   */
  serviceName: string;
  /**
   * property
   * The name of a method, that is provided in the methods map in serviceDefinition
   */
  methodName: string;
  /**
   * property
   * Type of communication between a consumer and a provider
   */
  asyncModel: AsyncModel;
  /**
   * property
   * A unique address of an endpoint
   * <protocol>://<host>:<port>/<path>
   */
  address: Address;
}
