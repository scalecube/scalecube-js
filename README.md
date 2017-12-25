# Scalecube-js
First version for scalecube js
Implemented only the Microservices basic pattern only local services without remote services (no gossip or SWIM)
Support CommonJS and ES6 modules with TS & Flow support

> First version documention will improve ;-)

## usage

```javascript
/// With proxies

const greetingService = Microservices
  .builder()
  .services(new GreetingService(), new GreetingService())
  .build()
  .proxy()
  .api(GreetingService)
  .create();  
greetingService.hello();

const greetingService = Microservices
  .builder()
  .services(new GreetingService(), new GreetingService())
  .build()
  .proxy()
  .api(GreetingService)
  .create();
greetingService.repeatToStream().subscribe(...);

/// direct 
const microservices = Microservices.builder()
  .services(new GreetingService())
  .build();

const dispatcher = microservices.dispatcher().create();

const message: Message = {
  serviceName: 'GreetingService',
  method: 'hello',
  data: {user: 'Idan'}
};


dispatcher.invoke(message);

const microservices = Microservices.builder()
  .services(new GreetingService())
  .build();

const dispatcher = microservices.dispatcher().create();

const message: Message = {
  serviceName: 'GreetingService',
  method: 'repeatToStream',
  data: [ 'Hello', 'Hey', 'Yo' ]
};

dispatcher.listen(message).subscribe();

/// loaders

// on demand
const greetingService = Microservices
.builder()
.serviceLoaders(
  {
    loader: () => ({
      then: (func) => {
        ImportGreetingService
          .then((GreetingService) => func(new GreetingService.default()))
      }
    }),
    serviceClass: GreetingService
  })
.build()
.proxy()
.api(GreetingService)
.create();

// on start
const greetingService = Microservices
.builder()
.serviceLoaders(
  {
    loader: () => new Promise((resolve, reject) =>
      ImportGreetingService.then((GreetingService) => resolve(mockFn(GreetingService))).catch(e => reject(e))
    ),
    serviceClass: GreetingService
  })
.build()
.proxy()
.api(GreetingService)
.create();

```
For more details how to use it see the tests

## Run/Debug
Install `yarn/npm install`  
Build `npm build`  
Run test `npm test`  

To run/debug jest tests:
* jest options: --runInBand --no-cache --env=jsdom 
* env variables: BABEL_ENV=commonjs
* you can run/debug via Webstorm or npm test or directly with jest and debug with Chrome: https://facebook.github.io/jest/docs/en/troubleshooting.html
![image](https://user-images.githubusercontent.com/4359435/30782375-e134617e-a139-11e7-8100-32f13ed3815f.png)

## Version 
* http://semver.org/ format

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
