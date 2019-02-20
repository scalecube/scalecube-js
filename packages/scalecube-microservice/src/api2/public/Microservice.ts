import { ProxyOptions, Dispatcher, DispatcherOptions, ServiceImplementation } from '.';

export default interface Microservice {
  createProxy(proxyOptions: ProxyOptions): ServiceImplementation;
  createDispatcher(dispatcherOptions: DispatcherOptions): Dispatcher;
}
