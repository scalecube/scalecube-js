import { MicroserviceOptions, Microservice } from '.';
/**
 * The factory for the creation of microservices containers
 */
export default interface Microservices {
  /**
   * The method for the creation of microservices containers
   */
  create(microserviceOptions: MicroserviceOptions): Microservice;
}
