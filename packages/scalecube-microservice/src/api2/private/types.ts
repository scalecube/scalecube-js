import { ServiceRegistry, Router, ServiceDefinition, ServiceCall, Service, Message, Endpoint } from '../public';

export interface AddServicesToRegistryOptions {
  services?: Service[];
  serviceRegistry: ServiceRegistry;
}

export interface ServiceCallOptions {
  router: Router;
  serviceRegistry: ServiceRegistry;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: ServiceDefinition;
}

export interface GetQualifierOptions {
  serviceName: string;
  methodName: string;
}

export interface InvokeMethodOptions {
  method: (arg: any) => any;
  message: Message;
  context: object;
}

export interface CreateServiceCallRequest {
  router: Router;
  serviceRegistry: ServiceRegistry;
}

export interface GetUpdatedServiceRegistryOptions {
  serviceRegistry: ServiceRegistry;
  service: Service;
}

export interface GetServicesFromRawServiceOptions {
  service: Service;
}

export interface AddServiceToRegistryOptions {
  serviceRegistry: ServiceRegistry;
  service: Service;
}

export interface GetServiceWithEndPointOptions {
  service: Service;
}

export interface AddEndpointToRegistryOptions {
  serviceRegistry: ServiceRegistry;
  endpoint: Endpoint;
}
