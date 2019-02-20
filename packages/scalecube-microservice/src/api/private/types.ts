import { Observable } from 'rxjs6';
import { ServiceRegistry, Router, ServiceDefinition, Service, Message, AsyncModel } from '../public';

export interface ServiceCallRequest {
  message: Message;
  asyncModel: AsyncModel;
  includeMessage: boolean;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallRequest) => ServiceCallResponse;

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

export interface Qualifier {
  serviceName: string;
  methodName: string;
}
