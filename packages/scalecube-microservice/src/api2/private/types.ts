import { ServiceRegistry, Router, ServiceDefinition, ServiceCall, RawService, Message } from '../public';

export interface AddServicesToRegistryOptions {
  services?: RawService[];
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
  rawService: RawService;
}

export interface GetServicesFromRawServiceOptions {
  rawService: RawService;
}
