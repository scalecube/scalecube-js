import MicroserviceProxy from './MicroserviceProxy';
import ServiceCall from './ServiceCall';
import CreateProxyRequest from './CreateProxyRequest';
import Router from './Router';
import Dispatcher from './Dispatcher';

export default interface Microservice {
  createProxy(createProxyRequest: CreateProxyRequest): MicroserviceProxy<ServiceCall>;
  createDispatcher(createDispatcherRequest: { router: Router }): Dispatcher;
}
