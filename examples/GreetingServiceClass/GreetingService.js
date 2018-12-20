// @flow

import { Observable } from "rxjs/Observable";

declare interface api {
  meta: {}
}
class GreetingService implements api {
  hello(name: string): Promise {
    return new Promise((resolve: () => string, reject: () => void)=>{
      if( !name ) {
        reject(new Error("please provide user to greet"));
      } else {
        resolve(`Hello ${name}`);
      }
    });
  }
  repeatToStream(...greetings: string[]): () => {} | void {
    return Observable.create((observer: Observable) => {
      if( !greetings || !greetings.length || !Array.isArray(greetings) ) {
        observer.error(new Error("please provide Array of greetings"));
        return ()=>{};
      }
      greetings.map((i: {}): Observable => observer.next(i));
      return ()=> { window["repeatToStreamUnsubscribe"] = true; };
    });
  }
}
Object.defineProperty(GreetingService, "meta", {
  value: {
    type: "class",
    methods: {
      hello: {
        type: "Promise"
      },
      repeatToStream: {
        type: "Observable"
      },
    }
  }
});

export default GreetingService;
