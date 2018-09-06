[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Scalecube-js
Microservices library inspired by the java scalecube-services. scalecube-js provides an abstraction toolkit to provision and consume microservices as such the interaction model is by a service api avoiding tight-coupeling between service implemntation and technology.

With scalecube-js decouple service by interface and agnostic to the location of service implementaion, location, and technology.
in the roadmap scalecube-js will support client side and server side. as such services may be:
* Deployable unit of same application and technology
* Deployable unit of diffrent application and diffrent technology
* Diffrent service workers in a browser
* Node-js services on same host
* Node-js services on diffrent host communicating via api.

## Project Status
currently the project is at very early stage and only support the basic pattern of service provisioning and consuming (locally)
it means it can be used to decouple components by interface for same running process.

## Basic Usage

### Define service in TypeScript:
```javascript

@Service
class GreetingService {

  @ServiceMethod('Observable')
  notifications(): Observable<Greeting> {

  }

  @ServiceMethod('Promise')
  hello(): Promise<Greeting> {
    return new Promise((resolve, reject) => {
      // the resolve / reject functions control the fate of the promise
    });
  }
}

```

### Bootstrap the service:
```javascript
// build microservices instance and provision (N) in this case two microservices to play role in our application.
// the builder inspect the service instances and find the service api and register it.
let microservices = Microservices.builder()
  .services(new GreetingService())
  .build();

// create a proxy to the service based on a given service interface.
const greetingService = microservices.proxy()
  .api(GreetingService)
  .create();

// invoke the service using the proxy.
// the proxy will locate and route and balance the request to the given matching instances.
greetingService.hello('joe');
```

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
* jest options: --runInBand --no-cache --env=jsdom --testURL=http://localhost
* env variables: BABEL_ENV=commonjs
* you can run/debug via Webstorm or npm test or directly with jest and debug with Chrome: https://facebook.github.io/jest/docs/en/troubleshooting.html
![image](https://user-images.githubusercontent.com/4359435/30782375-e134617e-a139-11e7-8100-32f13ed3815f.png)

## Version
* http://semver.org/ format

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
