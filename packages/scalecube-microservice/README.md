[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices

This package provides Scalecube's implementation for microservices architecture.

## documentation

please [Read](http://scalecube.io/javascript-docs) before starting to work with scalecube.

## Usage

#### Define a service

```typescript
import { ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';

export const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: { 
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    }
  },
};
```

#### Create a service

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';
import { greetingServiceDefinition } from './definitions';

createMicroservice({
  service : [{
    definition: greetingServiceDefinition,
    reference: {
      hello : (name) => `Hello ${name}`
    }, 
   }],
   address : 'seed'
});
```

##### example of working with dependencies

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';
import { greetingServiceDefinition } from './definitions';

createMicroservice({
  service : [{
    definition: greetingServiceDefinition,
    reference: ({ createProxy, createServiceCall }) => {
      // callback response with createProxy or createServiceCall
      // it is possible to inject the proxy/serviceCall to the service
      const proxy = createProxy({ serviceDefinition: remoteServiceDefinition});
      return new GreetingService(proxy);
    }
   }],
   address : 'seed'
});
```

#### Use the service

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';

const microservice = createMicroservice({
  address : 'ms1',
  seedAddress : 'seed'
});
```

##### example of creating and using a proxy

```typescript
// createProxy will return a Proxy(service)
const proxyName = microservice.createProxy({
    serviceDefinition: remoteServiceDefinition
});

proxyName.hello('ME').then(console.log) // Hello ME
```
