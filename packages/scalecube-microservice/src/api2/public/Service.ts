import { ServiceImplementation, ServiceDefinition } from '.';

export default interface Service {
  definition: ServiceDefinition;
  implementation: ServiceImplementation;
}
