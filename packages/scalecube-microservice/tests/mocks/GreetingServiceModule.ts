import { Observable } from 'rxjs6';
import { ASYNC_MODEL_TYPES } from '../../src/helpers/constants';

export const hello = (name: string): Promise<string> => {
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

export const greetingServiceDefinitionHello = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

export const greetingServiceDefinitionGreet$ = {
  serviceName: 'GreetingService',
  methods: {
    greet$: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
    },
  },
};
