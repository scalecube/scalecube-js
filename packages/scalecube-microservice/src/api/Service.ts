import { ServiceImplementation, ServiceDefinition } from '.';

/**
 * The information about service and the implementation for all the methods that are included in it
 */
export default interface Service {
  /**
   * The metadata for a service, that includes the name of a service and the map of methods that are
   * included in it
   */
  definition: ServiceDefinition;
  /**
   * The implementation of a service, that can be an object with methods or a module with a function being exported
   */
  reference: ServiceImplementation;
}
