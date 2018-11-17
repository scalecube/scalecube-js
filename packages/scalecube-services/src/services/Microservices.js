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
    mw: any;
    serviceRegistery: ServiceRegistery;

    constructor(msBuilder: Builder) {
        this.serviceRegistery = new ServiceRegistery(msBuilder.servicesConfig);
        this.mw = msBuilder.myMW;
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
  myMW: any;

  constructor() {
    this.servicesConfig = new ServicesConfig([]);
    this.myMW = (msg) => msg;
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

  mw(mw:any){
    this.myMW = mw;
    return this;
  }

  build(): Microservices {
    return new Microservices(this);
  }
}
