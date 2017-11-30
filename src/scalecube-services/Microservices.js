// @flow
import { ServicesConfig, ServiceRegistery, ProxyContext } from 'src/scalecube-services'

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

export type MicroservicesBuilder = Builder;