import { Observable } from 'rxjs';
import { ASYNC_MODEL_TYPES } from '../../src/helpers/constants';

/* tslint:disable */

class GreetingService {
  public empty: null;
  constructor() {
    this.empty = null;
  }

  public hello = (name: any): any => {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  };

  public greet$(greetings: string[]): Observable<string> {
    return new Observable((observer) => {
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of greetings'));
        return () => {};
      }
      greetings.map((i) => observer.next(`greetings ${i}`));
      return () => {};
    });
  }
}

export const GreetingServiceWithStatic = class {
  public static hello = (name: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  };

  public static greet$(greetings: string[]): Observable<string> {
    return new Observable((observer) => {
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of greetings'));
        return () => {};
      }
      greetings.map((i) => observer.next(`greetings ${i}`));
      return () => {};
    });
  }
};

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

export default GreetingService;
