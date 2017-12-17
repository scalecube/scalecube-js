// @flow

import { Router, Message } from 'src/scalecube-services/services';

export class ServiceCall{
  router: Router;
  constructor(router: Router, timeout:number = 5000){
    this.router = router;
  }
  invoke(message: Message):Promise<Message> {
    return new Promise((resolve, reject)=>{
      if( !Array.isArray(message.data) ) {
        return reject(new Error(`Message format error: data must be Array`));
      }
      const inst = this.router.route(message);
      if( inst ) {
        return resolve(inst.service[message.method](...message.data));
      }
      reject(new Error(`Service not found error: ${message.serviceName}.${message.method}`));
    });
  }
}