// import ServiceCallResponse from './DispatcherResponse';
// import Qualifier from './Qualifier';
// import Microservice from './Microservice';
// import ServiceDefinition from './ServiceDefinition';

// Keep the message interface

export default interface Message {
  qualifier?: string;
  data: any;
  // requestParams: any[];
  // microservice: Microservice;
  // serviceDefinition: ServiceDefinition;
  // response?: ServiceCallResponse;
}
