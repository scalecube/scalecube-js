// @flow
import GreetingService from './GreetingService';
import makeLoader from 'src/annotations/es6/makeLoader'

const PromiseGreetingService = makeLoader(
  import('./GreetingService').then((GreetingService) => new GreetingService.default()),
  GreetingService
);

const onDemandLoader = () => {

  return {
    then: (func)=>{
      console.log(new Error());
      import('./GreetingService')
        .then((GreetingService) => func(new GreetingService.default()))
    }
  }

}

const OnDemandGreetingService = makeLoader(
  onDemandLoader(),
  GreetingService
);


export { PromiseGreetingService, OnDemandGreetingService, onDemandLoader };


/*const GreetingServiceImpl = import('./GreetingService');

 // If you want to register a promise for a service
 // - you need to make sure it's resolving new instance of the service
 // - you need to wrap it so then will return your instance
 // - you need to supply the service name on the promise object

 const PromiseGreetingService = new Promise((resolve, reject)=>{
 GreetingServiceImpl
 .then((GreetingService)=>resolve(new GreetingService))
 .catch((error)=>reject(error))
 });
 const meta = GreetingService.meta;
 Object.defineProperty(PromiseGreetingService, 'meta', {
 value:
 Object.assign(meta, {
 type: 'loader',
 serviceName: 'GreetingService'
 })
 });

 */
