// @flow
import { Router, RoundRobinServiceRouter, Microservices } from ".";

export class ProxyContext{
  myapi: any;
  router: typeof Router;
  microservices: Microservices;
  constructor(microservices: Microservices) {
    this.microservices = microservices;
    this.router = RoundRobinServiceRouter;
  }

    /**
     *
     * @param api
     *
     * @param router
     * @return {api}
     */
  createProxy(api: any, router: typeof Router){
    const dispatcher = this.microservices.dispatcher().router(router).create();
    return new Proxy({}, {
      get: (target, prop) => {
        if( api.meta.methods[prop] ) {
           return (...args) => {
               const message = {
                   serviceName: api.name,
                   method: prop,
                   data: args
               };
               if( api.meta.methods[prop].type === 'Promise' ) {
                   return dispatcher.invoke(message);
               } else if ( api.meta.methods[prop].type === 'Observable' ) {
                   return dispatcher.listen(message);
               } else {
                   return Error(`service method unknown type error: ${api.name}.${prop}`);
               }
           };
        }
        return undefined;
      }
    });
  }
  create(){
    return this.createProxy(this.myapi, this.router);
  }
  api(api: any) {
    this.myapi = api;
    return this;
  }
}
