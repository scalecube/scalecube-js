// @flow
import { Observable } from 'rxjs/Observable';

interface api {
  static meta: {};
}
class GreetingService implements api {
  hello(name: string) {
    return new Promise((resolve, reject)=>{
      if( !name || (name && !name.length)) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  }
  repeatToStream(...greetings: string[]) {
    return Observable.create((observer) => {
      if( !greetings || !greetings.length || !Array.isArray(greetings) ) {
        observer.error(new Error('please provide Array of greetings'));
        return ()=>{};
      }
      greetings.map((i)=>observer.next(i));
      return ()=>{window['repeatToStreamUnsubscribe']=true};
    });
  }
}
Object.defineProperty(GreetingService, 'meta', {
  value: {
    type: 'class',
    methods: {
      hello: {
        type: 'Promise'
      },
      repeatToStream: {
        type: 'Observable'
      },
    }
  }
});

export default GreetingService;
