import { Observable } from 'rxjs6';
import { AsyncModel } from '../src/api/public';

class GreetingService {
  public hello = (name: any): any => {
    return new Promise((resolve, reject) => {
      if (!name) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  };

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

export const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: 'Promise' as AsyncModel,
    },
    greet$: {
      asyncModel: 'Observable' as AsyncModel,
    },
  },
};

export default GreetingService;
