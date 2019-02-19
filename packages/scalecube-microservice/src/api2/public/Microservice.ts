import ProxyOptions from './ProxyOptions';
import Router from './Router';
import Dispatcher from './Dispatcher';

export default interface Microservice {
  createProxy(proxyOptions: ProxyOptions): object;
  createDispatcher(createDispatcherRequest: { router: Router }): Dispatcher;
}
