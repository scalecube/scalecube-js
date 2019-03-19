import { ServiceImplementation, ServiceDefinition } from './public';

export default interface Service {
  definition: ServiceDefinition;
  reference: ServiceImplementation;
}
