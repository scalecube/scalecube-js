import { ServiceDefinition, Router } from '.';

export default interface ProxyOptions {
  router?: Router;
  serviceDefinition: ServiceDefinition;
}
