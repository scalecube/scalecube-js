// @flow
import {
  ServicesConfig,
  ServiceRegistery,
  ProxyContext,
  DispatcherContext,
  utils
} from ".";

class Builder {
    servicesConfig: ServicesConfig;
    myPreRequest: any;

    constructor() {
      this.servicesConfig = new ServicesConfig([]);
      this.myPreRequest = msg => msg;
    }

    services(...services: any[]) {
      this.servicesConfig = ServicesConfig.builder(this)
        .services(services)
        .create();
      return this;
    }

    serviceLoaders(...services: { loader: () => Promise<any>, serviceClass: any }[]) {
      services.map(s => this.services(utils.makeLoader(s.loader(), s.serviceClass)));
      return this;
    }

    preRequest(mw: any){
      this.myPreRequest = mw;
      return this;
    }

    // eslint-disable-next-line no-use-before-define
    build(): Microservices {
      return new Microservices(this);
    }
}

export class Microservices {
    static Builder: Builder;
    preRequest: any;
    serviceRegistery: ServiceRegistery;

    constructor(msBuilder: Builder) {
      this.serviceRegistery = new ServiceRegistery(msBuilder.servicesConfig);
      this.preRequest = msBuilder.myPreRequest;
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
