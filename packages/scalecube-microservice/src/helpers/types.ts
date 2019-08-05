// @ts-ignore
import { RSocketClientSocket } from 'rsocket-core';
import { Observable } from 'rxjs';
import { Address, TransportApi, MicroserviceApi, DiscoveryApi, Message, RouterApi, Endpoint } from '@scalecube/api';

export interface ServiceCallOptions {
  message: Message;
  asyncModel: MicroserviceApi.AsyncModel;
  messageFormat: boolean;
}

export type ServiceCallResponse = Observable<any> | Promise<any>;

export type ServiceCall = (serviceCallRequest: ServiceCallOptions) => ServiceCallResponse;

export interface AvailableServices {
  services?: MicroserviceApi.Service[];
  address?: Address;
}

export interface CreateServiceCallOptions {
  router: RouterApi.Router;
  microserviceContext: MicroserviceContext;
  transportClientProvider?: TransportApi.ClientProvider;
}

export interface GetProxyOptions {
  serviceCall: ServiceCall;
  serviceDefinition: MicroserviceApi.ServiceDefinition;
}

export interface LocalCallOptions {
  localService: Reference;
  asyncModel: MicroserviceApi.AsyncModel;
  message: Message;
  messageFormat: boolean;
  microserviceContext: MicroserviceContext;
}

export interface RemoteCallOptions {
  router: RouterApi.Router;
  microserviceContext: MicroserviceContext;
  message: Message;
  asyncModel: MicroserviceApi.AsyncModel;
  transportClientProvider?: TransportApi.ClientProvider;
}

export interface InvokeMethodOptions {
  method: (...args: any[]) => any;
  message: Message;
}

export interface AddMessageToResponseOptions {
  messageFormat: boolean;
  message: Message;
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
  connectionManager: ConnectionManager;
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
  createEndPoints: (options: AvailableServices) => Endpoint[];
  destroy: () => void;
}

export interface RemoteRegistryMap {
  [qualifier: string]: Endpoint[];
}

export interface UpdatedRemoteRegistry extends DiscoveryApi.ServiceDiscoveryEvent {
  type: DiscoveryApi.Type;
  items: DiscoveryApi.Item[];
  remoteRegistryMap: RemoteRegistryMap;
}

export type CreateConnectionManager = () => ConnectionManager;

export interface ConnectionManager {
  getConnection: (connectionAddress: string) => Promise<RSocketClientSocket>;
  getAllConnections: () => { [key: string]: Promise<RSocketClientSocket> };
  setConnection: (connectionAddress: string, value: Promise<RSocketClientSocket>) => void;
  removeConnection: (connectionAddress: string) => void;
}
