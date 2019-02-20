import { ProxyOptions, Dispatcher, DispatcherOptions } from '.';

export default interface Microservice {
  createProxy(proxyOptions: ProxyOptions): { [methodName: string]: any };
  createDispatcher(dispatcherOptions: DispatcherOptions): Dispatcher;
}
