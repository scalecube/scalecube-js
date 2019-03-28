import { Observable } from 'rxjs';
import { ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
var GreetingService = /** @class */ (function() {
  function GreetingService() {
    this.hello = function(name) {
      return new Promise(function(resolve, reject) {
        if (!name) {
          reject(new Error('please provide user to greet'));
        } else {
          resolve('Hello ' + name);
        }
      });
    };
    this.empty = null;
  }
  GreetingService.prototype.greet$ = function(greetings) {
    return new Observable(function(observer) {
      if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
        observer.error(new Error('please provide Array of greetings'));
        return function() {};
      }
      greetings.map(function(i) {
        return observer.next('greetings ' + i);
      });
      return function() {};
    });
  };
  return GreetingService;
})();
export var greetingServiceDefinition = {
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
