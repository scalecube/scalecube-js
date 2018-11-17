// @flow
import {Router, RoundRobinServiceRouter, Microservices, ServiceDefinition} from ".";
import type {Message} from ".";

export class ProxyContext{
  myapi: any;
  router: typeof Router;
  // myMW: (msg:Message, mc: Microservices, def: Object) => Message;
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
    const meta = api.meta;
    const mw = this.microservices.mw;

    if( !meta ) {
        return Error("API must have meta property");
    }

    meta.serviceName = meta.serviceName || meta.name || api.name;
    if( !meta.serviceName ) {
        return Error("service name (api.meta.serviceName) is not defined");
    }
    if( !meta.methods ) {
        return Error("meta.methods is not defined");
    }
    return new Proxy({}, {
      get: (target, prop) => {
        if( meta.methods[prop] ) {
           return (...args) => {
               const message = mw({
                       serviceName: meta.serviceName,
                       method: prop,
                       data: args
                   },
                   this.microservices,
                   meta
               );

               if( meta.methods[prop].type === "Promise" ) {
                   return dispatcher.invoke(message);
               } else if ( meta.methods[prop].type === "Observable" ) {
                   return dispatcher.listen(message);
               } else {
                   return Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
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
