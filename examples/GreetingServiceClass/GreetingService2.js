// @flow
import { Observable } from 'rxjs/Observable';

interface api {
  static meta: any;
}
class GreetingService2 implements api {
  static meta: any;
  hello(name: string) {
    return new Promise((resolve, reject)=>{
      if( name === undefined ) {
        reject(new Error('please provide user to greet'));
      } else {
        resolve(`hey ${name}`);
      }
    });
  }
  repeatToStream(...greetings: string[]) {
    return Observable.create((observer) => {
      if( greetings === undefined || !Array.isArray(greetings) || greetings.length === 0 ) {
        observer.error(new Error('please provide Array of greetings'));
        return ()=>{};
      }
      greetings.map((i)=>observer.next(i));
      return ()=>{window['repeatToStreamUnsubscribe']=true};
    });
  }
}
Object.defineProperty(GreetingService2, 'meta', {
  value: {
    type: 'class',
    name: 'greeting2',
    methods: {
      hello: {
        type: 'Promise'
      },
      repeatToStream: {
        type: 'Observable'
      }
    }
  }
});


export default GreetingService2;
