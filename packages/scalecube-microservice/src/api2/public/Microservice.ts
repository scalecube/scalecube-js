import { ProxyOptions, Dispatcher, DispatcherOptions } from '.';

export default interface Microservice {
  createProxy(proxyOptions: ProxyOptions): object;
  createDispatcher(dispatcherOptions: DispatcherOptions): Dispatcher;
}
