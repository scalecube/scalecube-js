import ServiceDefinition from './ServiceDefinition';

export default interface LazyService {
  serviceDefinition: ServiceDefinition;
  loader: () => Promise<object>;
}
