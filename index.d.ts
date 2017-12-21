
  declare class Map<K,V>{}

  declare class Class<T> {}
  // @flow

interface Class1 {

  data: Array<any>;
  method: string;
  serviceName: string;
}
interface Class2 {

  service: any;
}
interface Class0 {

  route(message: Class1): Class2 | null;
}
interface Class4 {

  microservicesBuilder: Class3;
  servicesBuilder: Array<ServicesConfig>;
  add(serviceBuilder: ServicesConfig): Class4;
  build(): Class3;
  builder(builder: Class3): void;
  constructor(builder: Class3);
  create(): ServicesConfig;
  services(...services: Array<any>): Class4;
}
interface Class3 {

  servicesConfig: ServicesConfig;
  build(): Microservices;
  constructor();
  services(...services: Array<any>): Class3;
}
export class DispatcherContext {

  router: Class0;
  timeout: number;
  constructor(router: Class0, timeout?: number);
  create(): ServiceCall;
}
declare var Message: Class<Class1>;
export class Microservices {
  static Builder: Class3;
  static builder(): Class3;

  serviceRegistery: ServiceRegistery;
  constructor(serviceConfig: ServicesConfig);
  proxy(): ProxyContext;
}
export class ProxyContext {

  myapi: any;
  router: Class0;
  api(api: any): ProxyContext;
  constructor(registery: ServiceRegistery);
  create(): {};
  createProxy(api: any, router: Class0): {};
}
export class RoundRobinServiceRouter implements Class0 {

  counter: Map<string, number>;
  registry: ServiceRegistery;
  constructor(registry: ServiceRegistery);
  route(request: Class1): Class2 | null;
}
declare var Router: Class<Class0>;
export class ServiceCall {

  router: Class0;
  constructor(router: Class0, timeout?: number);
  invoke(message: any): void | any;
}
export class ServiceDefinition {
  static from(service: Object): ServiceDefinition;

  methods: {[_: string]: (_: any) => any};
  serviceInterface: any;
  serviceName: string;
  constructor(serviceInterface: Object, serviceName: string, methods: {[_: string]: (_: any) => any});
}
declare var ServiceInstance: Class<Class2>;
export class ServiceRegistery {

  services: Object;
  constructor(serviceConfig: ServicesConfig);
  register(serviceConfig: ServicesConfig): void;
  serviceLookup(name: string): any;
}
export class ServicesConfig {
  static Builder: Class4;
  static builder(builder: Class3): Class4;

  mcBuilder: Class3;
  service: any;
  serviceDefinition: ServiceDefinition;
  servicesConfig: Array<ServicesConfig>;
  constructor(service: any, builder?:Class3);
}
declare var utils: {getServiceInterface: (o: Object) => any, getServiceName: (o: Object) => any};

  
  