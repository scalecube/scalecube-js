import MicroserviceConfig from './MicroserviceConfig';
import Microservice from './Microservice';

// MicroserviceConfig -> Options

export default interface Microservices {
  create(microservicesConfig: MicroserviceConfig): Microservice;
}
