import { Observable } from 'rxjs6';
import { ASYNC_MODEL_TYPES } from '../../src/helpers/constants';

class GreetingService2 {
  public hello = (name: any): any => {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to say hey to'));
      } else {
        resolve(`hey ${name}`);
      }
    });
  };

  public greet$(greetings: string[]) {
    return new Observable((observer) => {
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of heys'));
        return () => {};
      }
      greetings.map((i) => observer.next(`hey ${i}`));
      return () => {};
    });
  }
}

export const greetingServiceDefinition2 = {
  serviceName: 'GreetingService2',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
    greet$: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
    },
  },
};

export default GreetingService2;
