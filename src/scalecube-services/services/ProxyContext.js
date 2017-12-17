// @flow
import { Router, RoundRobinServiceRouter, Microservices } from "src/scalecube-services/services";

export class ProxyContext{
  myapi: any;
  router: typeof Router;
  microservices: Microservices;
  constructor(microservices: Microservices) {
    this.microservices = microservices;
    this.router = RoundRobinServiceRouter;
  }

  createProxy(api: any, router: typeof Router){
    const dispatcher = this.microservices.dispatcher().router(router).create();
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
    return this.createProxy(this.myapi, this.router);
  }
  api(api: any) {
    this.myapi = api;
    return this;
  }
}