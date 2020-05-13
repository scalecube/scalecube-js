// @ts-ignore
import { ReactiveSocket } from 'rsocket-types';
import { Observable } from 'rxjs';
import { Address, TransportApi, MicroserviceApi, DiscoveryApi } from '@scalecube/api';

export interface ServiceCallOptions {
  message: MicroserviceApi.Message;
  asyncModel: MicroserviceApi.AsyncModel;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallOptions) => ServiceCallResponse;

export interface AvailableServices {
  services?: MicroserviceApi.Service[];
  address?: Address;
}

export interface GetServiceCallOptions {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext;
  transportClient: TransportApi.ClientTransport;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
}

export interface LocalCallOptions {
  localService: Reference;
  asyncModel: MicroserviceApi.AsyncModel;
  message: MicroserviceApi.Message;
  microserviceContext: MicroserviceContext;
}

export interface RemoteCallOptions {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext;
  message: MicroserviceApi.Message;
  asyncModel: MicroserviceApi.AsyncModel;
  transportClient: TransportApi.ClientTransport;
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

export interface MicroserviceContext {
  remoteRegistry: RemoteRegistry;
  localRegistry: LocalRegistry;
  whoAmI: string;
  debug: boolean;
}

export type CreateLocalRegistry = () => LocalRegistry;

export interface LocalRegistry {
  lookUp: ({ qualifier }: MicroserviceApi.LookupOptions) => Reference | null;
  add: ({ services }: AvailableServices) => void;
  destroy: () => void;
}

export interface LocalRegistryMap {
  [qualifier: string]: Reference;
}

export type GetUpdatedLocalRegistry = (options: GetUpdatedLocalRegistryOptions) => LocalRegistryMap;

export interface GetUpdatedLocalRegistryOptions {
  localRegistryMap: LocalRegistryMap;
  references: Reference[];
}

export type GetReferenceFromServices = (options: AvailableServices) => Reference[] | [];

export type CreateRemoteRegistry = () => RemoteRegistry;

export interface RemoteRegistry {
  lookUp: MicroserviceApi.LookUp;
  update: (discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => void;
  createEndPoints: (options: AvailableServices) => MicroserviceApi.Endpoint[];
  destroy: () => void;
}

export interface RemoteRegistryMap {
  [qualifier: string]: MicroserviceApi.Endpoint[];
}

export interface UpdatedRemoteRegistry extends DiscoveryApi.ServiceDiscoveryEvent {
  type: DiscoveryApi.Type;
  items: DiscoveryApi.Item[];
  remoteRegistryMap: RemoteRegistryMap;
}

export interface MicroserviceContextOptions {
  address: Address;
  debug: boolean;
}

export interface SetMicroserviceInstanceOptions {
  debug?: boolean;
  microserviceContext: MicroserviceContext;
  transportClient: TransportApi.ClientTransport;
  discoveryInstance: DiscoveryApi.Discovery | null;
  serverStop: TransportApi.ServerStop;
  defaultRouter: MicroserviceApi.Router;
}

export interface GetServiceFactoryOptions {
  microserviceContext: MicroserviceContext;
  transportClient: TransportApi.ClientTransport;
  defaultRouter: MicroserviceApi.Router;
}

export interface FlatteningServices {
  services?: MicroserviceApi.Service[];
  serviceFactoryOptions: {
    createProxy: MicroserviceApi.CreateProxy;
    createServiceCall: MicroserviceApi.CreateServiceCall;
  };
}

export interface CreateProxy {
  router: MicroserviceApi.Router;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
  microserviceContext: MicroserviceContext | null;
  transportClient: TransportApi.ClientTransport;
}

export interface CreateServiceCall {
  router: MicroserviceApi.Router;
  microserviceContext: MicroserviceContext | null;
  transportClient: TransportApi.ClientTransport;
}

export interface Destroy {
  microserviceContext: MicroserviceContext | null;
  discovery: DiscoveryApi.Discovery | null;
  serverStop: TransportApi.ServerStop;
  transportClientDestroy: TransportApi.TDestroy;
}
