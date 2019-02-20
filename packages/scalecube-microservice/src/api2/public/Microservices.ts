import { MicroserviceOptions, Microservice } from '.';

export default interface Microservices {
  create(microserviceOptions: MicroserviceOptions): Microservice;
}
