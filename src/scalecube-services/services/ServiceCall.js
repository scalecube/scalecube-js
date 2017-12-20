// @flow

import { Router, Message } from 'src/scalecube-services/services';

interface Subscription {
  unsubscribe() : void;
}
interface Observable<T>{
  subscribe(): Subscription;
}
const isObservable = (obj: any): boolean => {
  if ( obj.constructor.name === 'Observable' ) {
    return true;
  }
  return false;
}

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
  listen(message: Message):Observable<Message>|Error {
      if( !Array.isArray(message.data) ) {
        return new Error(`Message format error: data must be Array`);
      }
      const inst = this.router.route(message);
      if( inst ) {
        const obs = inst.service[message.method](...message.data);
        if( isObservable(obs) ){
          return obs;
        } else {
          return new Error(`Service method not observable error: ${message.serviceName}.${message.method}`);
        }
      }
      return new Error(`Service not found error: ${message.serviceName}.${message.method}`);
  }
}