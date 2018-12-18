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
    postRequest: any;
    serviceRegistery: ServiceRegistery;

    constructor(msBuilder: Builder) {
        this.serviceRegistery = new ServiceRegistery(msBuilder.servicesConfig);
        this.preRequest = msBuilder.myPreRequest;
        this.postRequest = msBuilder.myPostRequest;
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
  myPreRequest: any;
  myPostRequest: any;

  constructor() {
    this.servicesConfig = new ServicesConfig([]);
    this.myPreRequest = msg => msg;
    this.myPostRequest = msg => msg;
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
    this.myPreRequest = mw;
    return this;
  }

  postRequest(mw:any){
    this.myPostRequest = mw;
    return this;
  }

  build(): Microservices {
    return new Microservices(this);
  }
}
