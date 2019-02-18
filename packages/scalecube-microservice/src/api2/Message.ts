import ServiceCallResponse from './DispatcherResponse';
import Qualifier from './Qualifier';
import Microservice from './Microservice';
import ServiceDefinition from './ServiceDefinition';

export default interface Message {
  qualifier: Qualifier;
  requestParams: any[];
  microservice: Microservice;
  serviceDefinition: ServiceDefinition;
  response?: ServiceCallResponse;
}
