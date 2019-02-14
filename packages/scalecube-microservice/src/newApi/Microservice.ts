import { MicroServiceConfig } from "../api/Service";
import { Observable } from "rxjs6";
import { defaultRouter } from "../Routers/default";
import { ServiceCallRequest } from "../api/Dispatcher";

export interface Discovery {

}

export type AsyncModel = 'Promise' | 'Observable' | 'OneWay' | 'BidirectionalRequestResponse';

export type ServiceCallResponse = Promise<any> | Observable<any> | void;

export type Dispatcher = (serviceCallRequest: ServiceCallRequest) => ServiceCallResponse;

export type MicroserviceProxy<T> = {
  get(): T;
}

export interface ServiceDefinition {
  serviceName: string;
  methods: {
    [methodName: string]: {
      asyncModel: AsyncModel
    }
  }
}

export interface CreateProxyRequest {
  router: any;
  serviceDefinition: ServiceDefinition;
}

export interface Qualifier {
  serviceName: string;
  methodName: string;
}

export interface Message {
  qualifier: Qualifier;
  requestParams: any[];
  response?: ServiceCallResponse;
}

export interface ServiceCallData {
  message: Message;
  serviceDefinition: ServiceDefinition;
  microservice: Microservice;
}

export interface CreateDispatcherRequest {
  router: any;
  serviceRegistry: any;
  preRequest: (preRequestRequest: Observable<ServiceCallData>, ) => Observable<ServiceCallData>;
  postResponse: (postResponseRequest: Observable<ServiceCallData>) => Observable<ServiceCallData>;
}

export interface Microservice {
  createProxy(createProxyRequest: CreateProxyRequest): MicroserviceProxy<Dispatcher>;
  createDispatcher(createDispatcherRequest: CreateDispatcherRequest): Dispatcher;
}

export interface Microservices {
  create(microServiceConfig: MicroServiceConfig): Microservice;
  createSeed(): Observable<Discovery>;
}

export interface ServiceRegistery {

}

export interface RouteRequest {
  serviceRegistry: ServiceRegistery;
  qualifier: Qualifier;
}

export interface Router {
  route: () => object
}
