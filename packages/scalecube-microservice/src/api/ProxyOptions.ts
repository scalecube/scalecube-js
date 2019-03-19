import { ServiceDefinition, Router } from './public';

export default interface ProxyOptions {
  router?: Router;
  serviceDefinition: ServiceDefinition;
}
