import MicroserviceOptions from './MicroserviceOptions';
import Microservice from './Microservice';

// MicroserviceConfig -> Options

export default interface Microservices {
  create(microservicesConfig: MicroserviceOptions): Microservice;
}
