import { Observable } from 'rxjs6';
import { generateIdentifier } from '../src/helpers/utils';

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
    return Observable.create((observer) => {
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of greetings'));
        return () => {};
      }
      greetings.map((i) => observer.next(`greetings ${i}`));
      return () => {};
    });
  }
}

const greetingServiceInstance = new GreetingService();

greetingServiceInstance.constructor = greetingServiceInstance.constructor || {};
// tslint:disable-next-line
greetingServiceInstance.constructor['meta'] = {
  serviceName: 'GreetingService',
  identifier: `${generateIdentifier()}`,
  methods: {
    hello: {
      asyncModel: 'Promise',
    },
    greet$: {
      asyncModel: 'Observable',
    },
  },
};

const createHelloService = () => ({
  identifier: `${generateIdentifier()}`,
  meta: {
    serviceName: 'GreetingService',
    methodName: 'hello',
    asyncModel: 'Promise',
  },
  hello: greetingServiceInstance.hello.bind(greetingServiceInstance),
});

/*
,
  {
    identifier: '_yy025n.4n',
    meta: {
      serviceName: 'GreetingService',
      methodName: 'greet$',
      asyncModel: 'Observable'
    },
    'greet$': greetingServiceInstance.greet$.bind(greetingServiceInstance)
  }
];
 */
export { greetingServiceInstance, createHelloService };
