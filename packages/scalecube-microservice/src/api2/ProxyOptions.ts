import ServiceDefinition from './ServiceDefinition';
import { Router } from '.';

export default interface ProxyOptions {
  router: Router;
  serviceDefinition: ServiceDefinition;
}
