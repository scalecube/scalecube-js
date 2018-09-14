// @flow
import { Router, RoundRobinServiceRouter, Microservices } from ".";
import EventEmitter from 'events';

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
        if( api.meta.methods[m].type === 'Promise' ) {
          return dispatcher.invoke(message);
        } else if ( api.meta.methods[m].type === 'Observable' ) {
          return dispatcher.listen(message);
        } else {
          return new Error(`service method unknown type error: ${api.name}.${m}`);
        }
      }
    });
    return obj;
  }
  create(){
    const microserviceInstance = this.createProxy(this.myapi, this.router);
    serviceEventEmitter.on('serviceRequest', async (event) => {
      const [empty, serviceName, methodName] = event.entrypoint.split('/');
      if (serviceName === microserviceInstance.meta.name) {
        const futureValue = microserviceInstance[methodName](...event.data);
        if (typeof futureValue.then === 'function') {
          const result = await futureValue;
          window.workers.workerURI.postMessage({
            data: {
              requestId: event.requestId,
              data: result,
              completed: false
            }
          });
          window.workers.workerURI.postMessage({
            data: {
              requestId: event.requestId,
              completed: true
            }
          });
        } else if (typeof futureValue.subscribe === 'function') {
          futureValue.subscribe(
            data => {
              window.workers.workerURI.postMessage({
                data: {
                  requestId: event.requestId,
                  data,
                  completed: false
                }
              });
            },
            error => console.log('error', error),
            () => {
              window.workers.workerURI.postMessage({
                data: {
                  requestId: event.requestId,
                  completed: true
                }
              });
            }
          )
        }
      }
    });

    return { serviceEventEmitter, microserviceInstance };
  }
  api(api: any) {
    this.myapi = api;
    return this;
  }
}
