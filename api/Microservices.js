// @flow

/**
 * definition for Microservices
 */
type List = any;
export interface ServicesConfig {
  constuctor(builder: Builder, service: Object): ServicesConfig;
}
export interface Message {

}
export interface ServiceCall {
  invoke(Message: message): Promise<Message>;
  listen(Message: message): Observable<Message>; TBD might use Iterators instead
}
export interface DispatcherContext {
  create(): ServiceCall;
}
export interface ProxyContext {
  create<T>(): T;
  timeout(duration: number): ProxyContext;
  api<T>(api: T): ProxyContext;
  router<T: Router>(router: T): T;
  router(): ProxyContext;
}
export interface ServiceRegistry {
  registerService(serviceObject: ServiceConfig): void;
  unregisterService(serviceObject: Object): void;
  serviceLookup(serviceName: string): List<ServiceInstance> ;
  getLocalInstance(serviceName: string, method:string): Optional<ServiceInstance>;

  services(): Collection<ServiceInstance>;

  getServiceDefinition(serviceName: string): Optional<ServiceDefinition>;
  registerInterface<T>(serviceInterface: T): ServiceDefinition;
}
export interface Router {
  route(message:Message): ServiceInstance;
}
export interface Builder{
  build(): Object;
  services(any): Builder;
};
export interface Microservices {
  builder(): Builder;
  dispatcher(): DispatcherContext;
  proxy(): ProxyContext;
  serviceRegistry(): ServiceRegistry;
}

