import { ServiceRegistry, Router, PreRequest, PostResponse, ServiceDefinition, ServiceCall, Microservice } from '.';

export interface ServiceCallOptions {
  router: Router;
  serviceRegistry: ServiceRegistry;
  preRequest?: PreRequest;
  postResponse?: PostResponse;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: ServiceDefinition;
  microservice: Microservice;
}

export interface GetQualifierOptions {
  serviceName: string;
  methodName: string;
}
