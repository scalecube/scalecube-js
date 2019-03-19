import { MicroserviceOptions, Microservice } from './public';

export default interface Microservices {
  create(microserviceOptions: MicroserviceOptions): Microservice;
}
