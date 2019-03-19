import { Observable } from 'rxjs';
import {
  Router,
  ServiceDefinition,
  Service,
  Message,
  AsyncModel,
  Endpoint,
  Reference,
  LookupOptions,
  LookUp,
} from '../api';

export interface ServiceCallOptions {
  message: Message;
  asyncModel: AsyncModel;
  includeMessage: boolean;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallOptions) => ServiceCallResponse;

export interface AvailableServices {
  services?: Service[];
}

export interface AvailableService {
  service: Service;
}

export interface CreateServiceCallOptions {
  router: Router;
  microserviceContext: MicroserviceContext;
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
  serviceRegistryMap: ServiceRegistryMap | null;
  endpoints: Endpoint[];
}

export interface GetUpdatedMethodRegistryOptions {
  methodRegistryMap: MethodRegistryMap | null;
  references: Reference[];
}

export interface LocalCallOptions {
  localService: Reference;
  asyncModel: AsyncModel;
  message: Message;
  includeMessage: boolean;
}

export interface RemoteCallOptions {
  router: Router;
  microserviceContext: MicroserviceContext;
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

export interface ServiceRegistryMap {
  [qualifier: string]: Endpoint[];
}

export interface MethodRegistryMap {
  [qualifier: string]: Reference;
}

export interface Registry {
  destroy: () => null;
}

type AddServiceToRegistry<T> = ({ services }: AvailableServices) => T;

export interface ServiceRegistry extends Registry {
  lookUp: LookUp;
  add: AddServiceToRegistry<ServiceRegistryMap>;
}

export interface MethodRegistry extends Registry {
  lookUp: ({ qualifier }: LookupOptions) => Reference | null;
  add: AddServiceToRegistry<MethodRegistryMap>;
}

export interface MicroserviceContext {
  serviceRegistry: ServiceRegistry;
  methodRegistry: MethodRegistry;
}
