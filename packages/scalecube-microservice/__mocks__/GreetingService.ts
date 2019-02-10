import { Observable } from 'rxjs6';
import { generateUUID } from '../src/helpers/utils';

class GreetingService {
  public hello(name?: string) {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  }

  public greet$(greetings: string[]) {
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

const createHelloService = () => {
  const greetingServiceInstance = new GreetingService();

  return {
    identifier: `${generateUUID()}`,
    meta: {
      serviceName: 'GreetingService',
      methodName: 'hello',
      asyncModel: 'Promise',
    },
    hello: greetingServiceInstance.hello.bind(greetingServiceInstance),
  };
};

const getGreetingServiceInstance = (identifier?: string) => {
  const greetingServiceInstance = new GreetingService();

  greetingServiceInstance.constructor = { ...greetingServiceInstance.constructor } || {};
  // tslint:disable-next-line
  greetingServiceInstance.constructor['meta'] = {
    serviceName: 'GreetingService',
    identifier: `${generateUUID(identifier)}`,
    methods: {
      hello: {
        asyncModel: 'Promise',
      },
      greet$: {
        asyncModel: 'Observable',
      },
    },
  };
  return greetingServiceInstance;
};

export { getGreetingServiceInstance, createHelloService };
