import { Observable } from 'rxjs6';
import {
  Registry,
  Router,
  ServiceDefinition,
  Service,
  Message,
  AsyncModel,
  Endpoint,
  ServiceRegistryDataStructure,
  MethodRegistryDataStructure,
  Reference,
} from '../public';

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

export interface GetUpdatedServiceRegistryOptions {
  serviceRegistry: ServiceRegistryDataStructure | null;
  endpoints: Endpoint[];
}

export interface GetUpdatedMethodRegistryOptions {
  methodRegistry: MethodRegistryDataStructure | null;
  references: Reference[];
}

export interface GetDataFromServiceOptions {
  service: Service;
  type: 'reference' | 'endPoint';
}

export interface LocalCallOptions {
  localService: Reference;
  asyncModel: AsyncModel;
  message: Message;
  includeMessage: boolean;
}

export interface RemoteCallOptions {
  router: Router;
  registry: Registry;
  message: Message;
  asyncModel: AsyncModel;
}

export interface InvokeMethodOptions {
  method: (...args: any[]) => any;
  message: Message;
}

export interface AddMessageToResponseOptions {
  includeMessage: boolean;
  message: Message;
}
