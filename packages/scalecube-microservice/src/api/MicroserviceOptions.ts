import { Service } from '.';

/**
 * The options for the creation of microservice container
 */
export default interface MicroserviceOptions {
  /**
   * An array of services, that will exist inside microservice container
   */
  services?: Service[];
}
