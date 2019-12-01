import { Observable } from 'rxjs';
import { ASYNC_MODEL_TYPES } from '@scalecube/browser';

export default class GreetingService {
  public hello(name: string): Promise<string> {
    console.info('hello ', name);
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  }

  public greet$(greetings: string[]): Observable<string> {
    return new Observable((observer) => {
      console.info('greet$ ', greetings);
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of greetings'));
      }
      greetings.map((i) => observer.next(`greetings ${i}`));
    });
  }
}

export const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
    greet$: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
    },
  },
};
