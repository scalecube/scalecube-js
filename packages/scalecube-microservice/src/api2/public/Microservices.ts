import MicroserviceOptions from './MicroserviceOptions';
import Microservice from './Microservice';

export default interface Microservices {
  create(microserviceOptions: MicroserviceOptions): Microservice;
}
