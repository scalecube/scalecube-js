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
        this.preRequest = msBuilder.newPreRequest;
        this.postResponse = msBuilder.newPostResponse;
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
  newPreRequest: any;
  newPostResponse: any;

  constructor() {
    this.servicesConfig = new ServicesConfig([]);
    this.newPreRequest = msg => msg;
    this.newPostResponse = msg => msg;
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
    this.newPreRequest = mw;
    return this;
  }

  postResponse(mw:any){
    this.newPostResponse = mw;
    return this;
  }

  build(): Microservices {
    return new Microservices(this);
  }
}
