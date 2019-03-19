[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices - Basic Usage

Scalecube.js microservices basic usage for creating microfrontend.

## Create a service

The contract the creator of the service need to uphold.

```javascript
// serviceDefinition is a plain object, that describes the asyncModel for each method, that you want to use within your microfrontend
export const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: {
    hello: {
      asyncModel: 'RequestResponse', // Promise
    },
    greet$: {
      asyncModel: 'RequestStream', // Observable
    },
  },
};
```

Create your service how ever you like,
It can be done using Class approach

```javascript
// service can be class
export default class GreetingService {
  hello(name) {
    return Promise.resolve(`hello ${name}`);
  }
  greet$(...names) {
    // RX.Js from() creator of Observable
    return from(names).pipe(map((name) => `greetings ${name}`));
  }
}
```

It can be done using Module approach

```javascript
// service can be module || function
export const hello = (name) => Promise.resolve(`hello ${name}`);
export const greet$ = (...names) => from(names).pipe(map((name) => `greetings ${name}`));
```

## Provision the service

The provider of the service creates microserviceContainer and specifies the services that should be included in it

```javascript
// Creating microservice from class
const microserviceContainer = Microservices.create({
  services: [
    {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    },
  ],
});
```

```javascript
// Creating microservice from module
const microserviceContainer = Microservices.create({
  services: [
    {
      definition: greetingServiceDefinition,
      reference: {hello, greet$}
    },
  ],
});
```

## Creating a proxy from the microservice and use the service

```javascript
// the consumer of the service creates a proxy from the microserviceContainer
const greetingServiceProxy = microserviceContainer.createProxy({
  serviceDefinition: greetingServiceDefinition,
});

// then the consumer can invoke the method from GreetingService using the proxy
greetingServiceProxy.hello('someone').then((response) => console.log(response)); // hello someone
greetingServiceProxy.greet$(['someone1','someone2'])
  .subscribe((response) => 
    console.log(response) // greetings someone1 
  );                      // greetings someone2
```
