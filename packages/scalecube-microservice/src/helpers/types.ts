import { Observable } from 'rxjs';
import { Address, TransportApi, MicroserviceApi } from '@scalecube/api';

export interface ServiceCallOptions {
  message: MicroserviceApi.Message;
  asyncModel: MicroserviceApi.AsyncModel;
  messageFormat: boolean;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallOptions) => ServiceCallResponse;

export interface AvailableServices {
  services?: MicroserviceApi.Service[];
  address?: Address;
}

export interface AvailableService {
  service: MicroserviceApi.Service;
  address?: Address;
}

export interface CreateServiceCallOptions {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext;
  transportClientProvider: TransportApi.ClientProvider;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
}

export interface Qualifier {
  serviceName: string;
  methodName: string;
}

export interface GetUpdatedServiceRegistryOptions {
  serviceRegistryMap: ServiceRegistryMap | null;
  endpoints: MicroserviceApi.Endpoint[];
}

export interface GetUpdatedMethodRegistryOptions {
  methodRegistryMap: MethodRegistryMap | null;
  references: Reference[];
}

export interface LocalCallOptions {
  localService: Reference;
  asyncModel: MicroserviceApi.AsyncModel;
  message: MicroserviceApi.Message;
  messageFormat: boolean;
}

export interface RemoteCallOptions {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext;
  message: MicroserviceApi.Message;
  asyncModel: MicroserviceApi.AsyncModel;
  transportClientProvider: TransportApi.ClientProvider;
  openConnections: { [key: string]: any };
}

export interface InvokeMethodOptions {
  method: (...args: any[]) => any;
  message: MicroserviceApi.Message;
}

export interface AddMessageToResponseOptions {
  messageFormat: boolean;
  message: MicroserviceApi.Message;
}

export interface ServiceRegistryMap {
  [qualifier: string]: MicroserviceApi.Endpoint[];
}

export interface MethodRegistryMap {
  [qualifier: string]: Reference;
}

export interface Registry {
  destroy: () => null;
}

type AddServiceToRegistry<T> = ({ services, address }: AvailableServices) => T;

export interface ServiceRegistry extends Registry {
  lookUp: MicroserviceApi.LookUp;
  add: ({ endpoints }: { endpoints: MicroserviceApi.Endpoint[] }) => ServiceRegistryMap;
  createEndPoints: AddServiceToRegistry<MicroserviceApi.Endpoint[]>;
}

export interface MethodRegistry extends Registry {
  lookUp: ({ qualifier }: MicroserviceApi.LookupOptions) => Reference | null;
  add: AddServiceToRegistry<MethodRegistryMap>;
}

export interface MicroserviceContext {
  serviceRegistry: ServiceRegistry;
  methodRegistry: MethodRegistry;
}

export interface RsocketEventsPayload {
  data: any;
  metadata: any;
}

/**
 * Defines local service data
 */
export interface Reference {
  /**
   * The combination of serviceName and methodName: <serviceName/methodName>
   */
  qualifier: string;
  /**
   * The name of a service, that is provided in serviceDefinition
   */
  serviceName: string;
  /**
   * The name of a method, that is provided in the methods map in serviceDefinition
   */
  methodName: string;
  /**
   * The map of the name of a method from a service and its implementation
   */
  reference?: {
    [methodName: string]: (...args: any[]) => any;
  };
  /**
   * Type of communication between a consumer and a provider
   */
  asyncModel: MicroserviceApi.AsyncModel;
}
