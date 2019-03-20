import AsyncModel from './AsyncModel';

/**
 * Defines remote service data
 */
export default interface Endpoint {
  /**
   * The full path to the method: <transport/serviceName/methodName>
   */
  uri?: string;
  /**
   * The transport that is used to get access to the method implementation in the service
   * For instance: ws://100.1.2.1 | window | webWorker | https://100.1.2.1 | http://100.1.2.1
   */
  transport?: string;
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
   */
  address: string;
}
