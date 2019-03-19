import AsyncModel from './AsyncModel';

/**
 * The reference wrapper of the implementation of the method from a service
 */
export default interface Reference {
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
  reference?: {
    /**
     * The map of the name of method from a service and its implementation
     */
    [methodName: string]: (...args: any[]) => any;
  };
  /**
   * Type of communication between a consumer and a provider
   */
  asyncModel: AsyncModel;
}
