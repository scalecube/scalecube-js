[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices - Basic Usage

scalecube-js microservices basic usage for creating micro-frontEnd.

## Define service:

```javascript
// service can be class || module || function
class GreetingService {
  hello(name) {
    return Promise.resolve(`hello ${name}`);
  }
  greet$(...names) {
    return new Observable((observer) => {
      names.map((name) => observer.next(`greetings ${name}`));
      return () => {};
    });
  }
}
// serviceDefinition is a plain object
const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: 'Promise',
    },
    greet$: {
      asyncModel: 'Observable',
    },
  },
};
```

## Bootstrap the service:

```javascript
// the provider of the service create greetingService and export it.
const greetingService = Microservices.create({
  services: [
    {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    },
  ],
});

// the consumer of the service create a proxy from the greetingService.
const greetingServiceProxy = greetingService.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

// then the consumer can invoke the proxy
greetingServiceProxy.hello('someone').then((response) => console.log(response));
```

## ServiceDefinition structure

```
{
  serviceName: string; // name of the service
  methods: { // all methods in the service
    [methodName: string]: { // methodName
      asyncModel: AsyncModel; // Promise || Observable
    };
  };
}
```

# Version

- http://semver.org/ format

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
