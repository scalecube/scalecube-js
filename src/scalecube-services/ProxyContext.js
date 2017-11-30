// @flow
import { RoundRobinServiceRouter, DispatcherContext } from "src/scalecube-services";

export class ProxyContext{
  api: any;
  router: Router;
  constructor(registery) {
    this.router = new RoundRobinServiceRouter(registery);
  }

  createProxy(api, router){
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
    this.api = api;
    return this;
  }
}