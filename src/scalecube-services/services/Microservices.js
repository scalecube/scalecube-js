// @flow
import { ServicesConfig, ServiceRegistery, ProxyContext, DispatcherContext } from 'src/scalecube-services/services'

class Builder {
  servicesConfig: ServicesConfig;
  constructor(){
    this.servicesConfig = new ServicesConfig([]);
  }
  services(...services:any[]){
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
  static Builder: Builder;
  serviceRegistery: ServiceRegistery;
  constructor(serviceConfig: ServicesConfig){
    this.serviceRegistery = new ServiceRegistery(serviceConfig);
    return this;
  }
  static builder() {
    return new Builder();
  };
  proxy() {
    return new ProxyContext(this);
  }
  dispatcher() {
    return new DispatcherContext(this);
  }
}


// Microservices.Builder = new Builder();
