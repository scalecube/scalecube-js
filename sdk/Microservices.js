// @flow

// import {Router,DispatcherContext,ProxyContext} from './api/Microservices.js';
class util {
  static getInterface(o) {
    // we`ll have to think about this one... right new just a name
    return o.constructor.name;
  }
  static getName(o) {
    // we`ll have to think about this one... right new just a name
    return o.constructor.name;
  }
}
class ServiceDefinition {
  /**
   * Constructor of service definition instance.
   *
   * @param serviceInterface the class of the service interface.
   * @param serviceName - the qualifier of the service.
   * @param methods - the methods to invoke the service.
   */
  constructor(serviceInterface: Object, serviceName: string, methods:Object) {
    this.serviceInterface = util.getInterface(serviceInterface);
    this.serviceName = serviceName; // TODO check what to do with it if module
    this.methods = methods;
  }

  static from(service:Object) {
    const methods = {};
    //const x = new service();
    Object.getOwnPropertyNames(Object.getPrototypeOf(service)).map((method)=>{
      if( method !== 'constructor' && typeof service[method] === 'function' ) {
        methods[method] = service[method];
      }
    });

    return new ServiceDefinition(service, util.getName(service), methods);
  }
  // todo service can be instance or module
  /*
  static from(service: string | {name:string} | any): ServiceDefinition | Set<ServiceDefinition> {
    if( service.constructor && typeof service.constructor.name === 'string' ) {
      return Reflect.serviceInterfaces(service).stream()
        .map(foreach ->  ServiceDefinition.from(foreach))
        .collect(Collectors.toSet());
    } else if( typeof service.name === 'string' ) {
      return new ServiceDefinition(service),
        Reflect.serviceName(serviceInterface),
        Reflect.serviceMethods(serviceInterface));
    } else if( typeof service = 'string') {
      return new ServiceDefinition(null,serviceName,null);
    }
  }*/

/*public Method method(String name) {
  return methods.get(name);
}*/

/*public Map<String, Method> methods() {
  return methods;
}*/
}

const servicesBuilder = [];
class BuilderSC {
  microservicesBuilder;

  builder(builder) {
    this.microservicesBuilder = builder;
  }
  build() { // TODO return Microservices.Builder
    return this.microservicesBuilder.services(
      new ServicesConfig(servicesBuilder));
  }
  services(...services) {
    services[0].map((o)=>{
      if( typeof o === 'function') {
        console.error(new Error(`${o.name} is a class not instance`));
      }
      this.add(new ServicesConfig(o));
    });
    return this;
  }
  add(serviceBuilder) {
    servicesBuilder.push(serviceBuilder);
    return this;
  }
  create() {
    return new ServicesConfig(servicesBuilder);
  }
}
//extends ServicesConfigApi
class ServicesConfig{
  service;
  serviceDefinition;
  mcBuilder;
  servicesConfig;

  // public ServiceConfig(Object service) {
  // public ServiceConfig(Builder builder, Object service) {
  constructor(service: any, builder: ?Builder) {
    if( service && Array.isArray(service) ) {
      this.servicesConfig = service;
      return this;
    }
    if( builder && builder.constructor && builder.constructor.name !== 'Builder' ) {
      this.mcBuilder = builder;
    }
    this.service = service;
    this.serviceDefinition = ServiceDefinition.from(service);
    return this;
  }
  static builder(builder) {
    // TODO change it when splitting to files
    return new BuilderSC(builder);
  }
}
// extends BuilderApi

class ServiceRegistery {
  services;
  constructor(serviceConfig) {
    this.services = this.service || {};
    serviceConfig.servicesConfig.map((sc)=>{
      let f = this.register(sc);
    });
    return this;
  }
  serviceLookup(name){
    console.log(this.services[name]);
    return this.services[name];
  }
  register(serviceConfig: ServiceDefinition) {
    console.log(serviceConfig.serviceDefinition.serviceName);
    if(this.services[serviceConfig.serviceDefinition.serviceName]) {
      this.services[serviceConfig.serviceDefinition.serviceName].push(serviceConfig);
    } else {
      this.services[serviceConfig.serviceDefinition.serviceName] = [ serviceConfig ];
    }

  }
}


class RoundRobinServiceRouter implements Router {
  registry: ServiceRegistery;
  counter: WeakMap<string, number>;
  constructor(registry: ServiceRegistery) {
    this.registry = registry;
    this.counter = new Map();
  }
  route(request:Messsage): ServiceInstance {
    console.log(this.registry.serviceLookup(request.serviceName));
    const instances = this.registry.serviceLookup(request.serviceName)
      .filter(inst => inst.serviceDefinition.methods[request.method] !== "undefined" );

    if( instances.length > 1 ) {
      let index = (this.counter.get(request.serviceName) || 0) + 1 % instances.length;
      console.log(request.serviceName);
      this.counter.set(request.serviceName, index);
      return instances[index];
    } else if ( instances.length == 1 ) {
      return instances[0];
    } else {
      return null;
    }

  }
}
class ServiceCall{
  router;
  constructor(router){
    this.router = router;
  }
  invoke(message) {
    const inst = this.router.route(message).service;
    console.log(inst[message.method]);
    return inst[message.method](...message.data);
  }
}
class DispatcherContext {
  router: Router;
  timeout: number;
  constructor(router){
    this.router = router;
    this.timeout = 5000;
  }
  create(): API.ServiceCall {
    return new ServiceCall(this.router, this.timeout);
  }
}
class ProxyContext{

  router: Router;
  constructor(registery) {
    this.router = new RoundRobinServiceRouter(registery);
  }

  createProxy(api, router){
    const dispatcher = new DispatcherContext(router).create();
    const obj = Object.create(api);
    Object.getOwnPropertyNames(obj.prototype).map((prop)=>{
      if( prop !== 'constructor' ) {
        delete obj[prop];
      } else {
        obj[prop] = ()=>{};
      }
    });
    console.log(api.meta)
    Object.keys(api.meta.methods).map(m=>{
      obj[m] = (...args)=>{
        const message = {
          serviceName: api.name,
          method: m,
          data: args
        };
        return dispatcher.invoke(message);
      }
    });
    return obj;
  }
  create(){
        return this.createProxy(this.api, this.router);
  }
  api(api) {
    this.api = api;
    return this;
  }
}

class Builder {
  servicesConfig;
  constructor(){
    return this;
  }
  services(...services){
    this.servicesConfig = ServicesConfig.builder(this)
      .services(services)
      .create();
    return this;
  }
  build(): Microservices {
    return new Microservices(this.servicesConfig);
  }
}
export class Microservices {
    serviceRegistery: ServiceRegistery;
    constructor(serviceConfig: ServicesConfig){
      this.serviceRegistery = new ServiceRegistery(serviceConfig);
      return this;
    }
    static builder() {
        return new Builder();
    };
    proxy() {
      return new ProxyContext(this.serviceRegistery);
    }

}
