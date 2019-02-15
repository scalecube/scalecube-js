import MicroserviceProxy from './MicroserviceProxy';
import Dispatcher from './Dispatcher';
import CreateProxyRequest from './CreateProxyRequest';
import CreateDispatcherRequest from './CreateDispatcherRequest';

export default interface Microservice {
  createProxy(createProxyRequest: CreateProxyRequest): MicroserviceProxy<Dispatcher>;
  createDispatcher(createDispatcherRequest: CreateDispatcherRequest): Dispatcher;
}
