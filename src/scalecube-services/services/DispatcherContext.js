// @flow
import { ServiceCall, Router } from 'src/scalecube-services/services';

export class DispatcherContext {
  router: Router;
  timeout: number;
  constructor(router: Router, timeout:number = 5000){
    this.router = router;
    this.timeout = timeout;
  }
  create(): ServiceCall {
    return new ServiceCall(this.router, this.timeout);
  }
}