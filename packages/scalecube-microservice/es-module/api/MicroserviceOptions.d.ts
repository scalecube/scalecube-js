import { Service } from '.';
/**
 * The options for the creation of a microservice container
 */
export default interface MicroserviceOptions {
  /**
   * An array of services, that will exist inside a microservice container
   */
  services?: Service[];
  /**
   * An address of a seed
   */
  seedAddress?: string;
}
