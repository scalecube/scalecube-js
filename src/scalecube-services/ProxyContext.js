// @flow
import { Router, RoundRobinServiceRouter, DispatcherContext, ServiceRegistery } from "src/scalecube-services";

export class ProxyContext{
  myapi: any;
  router: Router;
  constructor(registery: ServiceRegistery) {
    this.router = new RoundRobinServiceRouter(registery);
  }

  createProxy(api: any, router: Router){
    const dispatcher = new DispatcherContext(router).create();
    const obj = Object.create(api);
    Object.getOwnPropertyNames(obj.prototype).map((prop)=>{
      if( prop !== 'constructor' ) {
        delete obj[prop];
      } else {
        obj[prop] = ()=>{};
      }
    });
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
  api(api: any) {
    this.myapi = api;
    return this;
  }
}