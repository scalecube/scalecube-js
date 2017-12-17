// @flow
import { ServiceCall, Router, RoundRobinServiceRouter } from 'src/scalecube-services/services';

export class DispatcherContext {
  myrouter: any;
  timeout: number;
  microservices:Microservices;

  constructor(microservices:Microservices, router: typeof Router = RoundRobinServiceRouter, timeout:number = 5000){
    this.microservices = microservices;
    this.myrouter = router;
    this.timeout = timeout;
  }
  router(router:typeof Router): DispatcherContext {
    this.myrouter = router;
    return this;
  }
  create(): ServiceCall {
    return new ServiceCall(new this.myrouter(this.microservices.serviceRegistery), this.timeout);
  }
}
