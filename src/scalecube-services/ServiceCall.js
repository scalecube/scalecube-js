// @flow

import { Router } from 'src/scalecube-services';

export class ServiceCall{
  router: Router;
  constructor(router: Router, timeout:number = 5000){
    this.router = router;
  }
  invoke(message:any) {
    const inst = this.router.route(message);
    if( inst ) {
      return inst.service[message.method](...message.data);
    }
    console.warn(`Service not found for message ${message}`);
  }
}