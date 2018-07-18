// @flow

import { Router, Message, utils } from 'src/scalecube-services/services';
import { Observable } from 'rxjs/Observable';
// $FlowFixMe
import 'rxjs/add/operator/catch';
import { isObservable } from './utils';

const createServiceObserver = (message, service, observer) => {
  const obs = service[ message.method ](...message.data);
  if (isObservable(obs)) {
    const sub = obs.subscribe(
      val => observer.next(val),
      error => observer.error(error)
    );
    return () => sub.unsubscribe();
  } else {
    observer.error(new Error(`Service method not observable error: ${message.serviceName}.${message.method}`));
    return () => {
    };
  }
}

export class ServiceCall {
  router: Router;

  constructor(router: Router, timeout: number = 5000) {
    this.router = router;
  }

  invoke(message: Message): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(message.data)) {
        return reject(new Error(`Message format error: data must be Array`));
      }

      const inst = this.router.route(message);

      if (inst && inst.service && utils.isLoader(inst)) {
        return inst.service.promise.then((myservice) => {
          return resolve(myservice[ message.method ](...message.data));
        });
      } else if (inst) {
        return resolve(inst.service[ message.method ](...message.data));
      }
      reject(new Error(`Service not found error: ${message.serviceName}.${message.method}`));
    });
  }

  listen(message: Message): Observable<Message> {
    return Observable.create((observer) => {
      if (!Array.isArray(message.data)) {
        observer.error(new Error(`Message format error: data must be Array`));
      }
      const inst = this.router.route(message);
      if (!inst) {
        observer.error(new Error(`Service not found error: ${message.serviceName}.${message.method}`));
      } else if (utils.isLoader(inst)) {
        let unsubscribe;
        const promise = new Promise(resolve=>{
          inst.service.promise.then((service) => {
            resolve(createServiceObserver(message, service, observer));
          }).catch(e=>observer.error(e));

        });
        return () => {
          promise.then(unsubscribe => unsubscribe());
        };
      } else {
        return createServiceObserver(message, inst.service, observer);
      }
    });
  }
}
