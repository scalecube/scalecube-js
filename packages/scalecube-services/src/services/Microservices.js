// @flow
import {
  ServicesConfig,
  ServiceRegistery,
  ProxyContext,
  DispatcherContext,
  utils
} from '.'

export class Microservices {
    static Builder: Builder;
    preRequest: any;
    postResponse: any;
    serviceRegistery: ServiceRegistery;

    constructor(msBuilder: Builder) {
        this.serviceRegistery = new ServiceRegistery(msBuilder.servicesConfig);
        this.preRequest = msBuilder.PreRequest;
        this.postResponse = msBuilder.PostResponse;
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

class Builder {
  servicesConfig: ServicesConfig;
  PreRequest: any;
  PostResponse: any;

  constructor() {
    this.servicesConfig = new ServicesConfig([]);
    this.PreRequest = (msg) => msg;
    this.PostResponse = (msg) => msg;
  }

  services(...services: any[]) {
    this.servicesConfig = ServicesConfig
        .builder(this)
        .services(services)
        .create();
    return this;
  }

  serviceLoaders(...services: { loader: () => Promise<any>, serviceClass: any }[]) {
    services.map((service) => this.services(utils.makeLoader(service.loader(), service.serviceClass)));
    return this;
  }

  preRequest(mw:any){
    this.PreRequest = mw;
    return this;
  }

  postResponse(mw:any){
    this.PostResponse = mw;
    return this;
  }

  build(): Microservices {
    return new Microservices(this);
  }
}
