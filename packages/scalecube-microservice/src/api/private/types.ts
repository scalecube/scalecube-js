import { Observable } from 'rxjs6';
import { Registry, Router, ServiceDefinition, Service, Message, AsyncModel, Endpoint } from '../public';

export interface ServiceCallOptions {
  message: Message;
  asyncModel: AsyncModel;
  includeMessage: boolean;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallOptions) => ServiceCallResponse;

export interface CreateRegistryOptions {
  services?: Service[];
}

export interface CreateServiceCallOptions {
  router: Router;
  registry: Registry;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: ServiceDefinition;
}

export interface Qualifier {
  serviceName: string;
  methodName: string;
}
