import MicroserviceConfig from './MicroserviceConfig';
import Microservice from './Microservice';

export default interface Microservices {
  create(microservicesConfig: MicroserviceConfig): Microservice;
}
