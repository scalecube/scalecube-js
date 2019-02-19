import MicroserviceProxy from './MicroserviceProxy';
import ServiceCall from './ServiceCall';
import ProxyOptions from './ProxyOptions';
import Router from './Router';
import Dispatcher from './Dispatcher';

export default interface Microservice {
  createProxy(createProxyRequest: ProxyOptions): MicroserviceProxy<ServiceCall>;
  createDispatcher(createDispatcherRequest: { router: Router }): Dispatcher;
}
