// @flow
import { ServiceCall, Router } from 'src/scalecube-services';

export class DispatcherContext {
  router: Router;
  timeout: number;
  constructor(router: Router){
    this.router = router;
    this.timeout = 5000;
  }
  create(): ServiceCall {
    return new ServiceCall(this.router, this.timeout);
  }
}