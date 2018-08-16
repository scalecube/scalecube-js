// @flow
import {
  ServicesConfig,
  ServiceRegistery,
  ProxyContext,
  DispatcherContext,
  utils
} from '.'

class Builder {
  servicesConfig: ServicesConfig;

  constructor() {
    this.servicesConfig = new ServicesConfig([]);
  }

  services(...services: any[]) {
    this.servicesConfig = ServicesConfig.builder(this)
      .services(services)
      .create();
    return this;
  }

  serviceLoaders(...services: { loader: () => Promise<any>, serviceClass: any }[]) {
    services.map((s) => this.services(utils.makeLoader(s.loader(), s.serviceClass)));
    return this;
  }

  build(): Microservices {
    return new Microservices(this.servicesConfig);
  }
}
export class Microservices {
  static Builder: Builder;
  serviceRegistery: ServiceRegistery;

  constructor(serviceConfig: ServicesConfig) {
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
