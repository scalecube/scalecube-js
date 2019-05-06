import { Observable } from 'rxjs';
import { ASYNC_MODEL_TYPES } from '../../src';

/* tslint:disable */

export const hello = (name: string): Promise<string> => {
  // @ts-ignore
  return new Promise((resolve, reject) => {
    if (!name) {
      reject(new Error('please provide user to greet'));
    } else {
      resolve(`Hello ${name}`);
    }
  });
};

export const greet$ = (greetings: string[]): Observable<string> => {
  return new Observable((observer) => {
    if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
      observer.error(new Error('please provide Array of greetings'));
      return () => {};
    }
    greetings.map((i) => observer.next(`greetings ${i}`));
    return () => {};
  });
};

export class GreetingService {
  public hello = hello;

  public greet$ = greet$;
}

export class GreetingServiceWithStatic {
  public static hello = hello;

  public static greet$ = greet$;
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
