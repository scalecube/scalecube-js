import { ServiceRegistry, Router, ServiceDefinition, ServiceCall, Service, Message } from '../public';

export default interface ActionForAddingServiceToRegistryRequest {
  services?: Service[];
  serviceRegistry: ServiceRegistry;
  isLazy?: boolean;
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

export default interface CreateServiceCallRequest {
  router: Router;
  serviceRegistry: ServiceRegistry;
}
