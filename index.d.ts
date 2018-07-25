
  declare class rxjs$Observable<T>{}
  
  declare class Map<K,V>{}
  
  declare class Class<T> {}
  // @flow

interface Class3 {

  data: Array<any>;
  method: string;
  serviceName: string;
}
interface Class4 {

  service: any;
}
interface Class2 {

  route(message: Class3): Class4 | null;
}
interface Class1 {

  microservicesBuilder: Class0;
  servicesBuilder: Array<ServicesConfig>;
  add(serviceBuilder: ServicesConfig): Class1;
  build(): Class0;
  builder(builder: Class0): void;
  constructor(builder: Class0);
  create(): ServicesConfig;
  services(...services: Array<any>): Class1;
}
interface Class0 {

  servicesConfig: ServicesConfig;
  build(): Microservices;
  serviceLoaders(...services: Array<{loader: () => Promise<any>, serviceClass: any}>): Class0;
  services(...services: Array<any>): Class0;
}
export class DispatcherContext {

  microservices: Microservices;
  myrouter: any;
  timeout: number;
  constructor(microservices: Microservices, router?: Class<Class2>, timeout?: number);
  create(): ServiceCall;
  router(router: Class<Class2>): DispatcherContext;
}
declare var Message: Class<Class3>;
export class Microservices {
  static Builder: Class0;
  static builder(): Class0;

  serviceRegistery: ServiceRegistery;
  constructor(serviceConfig: ServicesConfig);
  dispatcher(): DispatcherContext;
  proxy(): ProxyContext;
}
export class ProxyContext {

  microservices: Microservices;
  myapi: any;
  router: Class<Class2>;
  api(api: any): ProxyContext;
  constructor(microservices: Microservices);
  create(): {};
  createProxy(api: any, router: Class<Class2>): {};
}
export class RoundRobinServiceRouter implements Class2 {

  counter: Map<string, number>;
  registry: ServiceRegistery;
  constructor(registry: ServiceRegistery);
  route(request: Class3): Class4 | null;
}
declare var Router: Class<Class2>;
export class ServiceCall {

  router: Class2;
  constructor(router: Class2, timeout?: number);
  invoke(message: Class3): Promise<Class3>;
  listen(message: Class3): rxjs$Observable<Class3>;
}
export class ServiceDefinition {
  static from(service: Object): ServiceDefinition;
  static getMethod(meta: any, service: any, key: string): any | any;

  methods: {[_: string]: (_: any) => any};
  serviceInterface: any;
  serviceName: string;
  constructor(serviceInterface: Object, serviceName: string, methods: {[_: string]: (_: any) => any});
}
declare var ServiceInstance: Class<Class4>;
export class ServicePromise<T> extends Promise<T> {

  loader: (registery: ServiceRegistery) => Promise<T>;
  meta: any;
}

export class ServiceRegistery {

  services: Object;
  constructor(serviceConfig: ServicesConfig);
  register(serviceConfig: ServicesConfig): void;
  serviceLookup(name: string): Array<any>;
}
export class ServicesConfig {
  static Builder: Class1;
  static builder(builder: Class0): Class1;

  mcBuilder: Class0;
  service: any;
  serviceDefinition: ServiceDefinition;
  servicesConfig: Array<ServicesConfig>;
  constructor(service: any, builder?:Class0);
}
declare var utils: {getServiceInterface: (o: Object) => any, getServiceName: (o: Object) => any | any | any | any | any, isLoader: (inst: Object | null) => null | any | any | boolean, isObservable: (obs: any) => boolean, makeLoader: (loadFunction: Promise<any>, Class: any) => {meta: any, promise: Promise<any>}};

  
  
  