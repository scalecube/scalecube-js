import ServiceDefinition from './ServiceDefinition';

export default interface CreateProxyRequest {
  router: any;
  serviceDefinition: ServiceDefinition;
}
