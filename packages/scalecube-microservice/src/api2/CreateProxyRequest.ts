import ServiceDefinition from './ServiceDefinition';
import { Router } from '.';

// Use Options instead of config

export default interface CreateProxyRequest {
  router: Router;
  serviceDefinition: ServiceDefinition;
}
