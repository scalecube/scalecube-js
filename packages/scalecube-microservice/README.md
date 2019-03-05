[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices - Basic Usage

Scalecube.js microservices basic usage for creating microfrontend.

## Define service

```javascript
// service can be class || module || function
class GreetingService {
  hello(name) {
    return Promise.resolve(`hello ${name}`);
  }
  greet$(...names) {
    // RX.Js from() creator of Observable
    return from(names).pipe(map((name) => `greetings ${name}`));
  }
}

// serviceDefinition is a plain object, that describes the asyncModel for each method, that you want to use within your microfrontend
const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: 'RequestResponse',
    },
    greet$: {
      asyncModel: 'RequestStream',
    },
  },
};
```

## Bootstrap the service

```javascript
// the provider of the service creates microserviceContainer and specifies the services that should be included in it
const microserviceContainer = Microservices.create({
  services: [
    {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    },
  ],
});

// the consumer of the service creates a proxy from the microserviceContainer
const greetingServiceProxy = microserviceContainer.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

// then the consumer can invoke the method from GreetingService using the proxy
greetingServiceProxy.hello('someone').then((response) => console.log(response)); // hello someone
```

## Service structure

```
{
  definition: greetingServiceDefinition,
  reference: { // an object with all the methods that can be used in microfrontend
    [methodName: string]: (...args: any[]) => any
  }
}
```

## ServiceDefinition structure

```
{
  serviceName: string; // name of the service
  methods: { // all methods in the service
    [methodName: string]: { // methodName
      asyncModel: AsyncModel; // RequestResponse || RequestStream
    };
  };
}
```

# Version

- http://semver.org/ format

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
