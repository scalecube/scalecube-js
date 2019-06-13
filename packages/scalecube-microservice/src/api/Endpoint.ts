import { Address } from '@scalecube/api';
import AsyncModel from './AsyncModel';

/**
 * Defines remote service data
 */
export default interface Endpoint {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * The name of a service, that is provided in serviceDefinition
   */
  serviceName: string;
  /**
   * The name of a method, that is provided in the methods map in serviceDefinition
   */
  methodName: string;
  /**
   * Type of communication between a consumer and a provider
   */
  asyncModel: AsyncModel;
  /**
   * A unique address of an endpoint
   * <protocol>://<host>:<port>/<path>
   */
  address: Address;
}
