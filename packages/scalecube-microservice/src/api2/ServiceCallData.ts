import { Microservice, ServiceDefinition } from '.';

export default interface ServiceCallData {
  serviceDefinition: ServiceDefinition;
  microservice: Microservice;
}
