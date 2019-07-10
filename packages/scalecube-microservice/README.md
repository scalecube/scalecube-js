[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

# Microservices

This package provides Scalecube's implementation for microservices architecture.

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

#### Use the service

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';

const microservice = createMicroservice({
  address : 'ms1',
  seedAddress : 'seed'
});
```

##### example of resolving the proxy only when the service is available

```typescript
// createProxies will return a map of <proxyName: Promise<Proxy(service)>>
// this way we are able to request for multiple proxies in 1 function.
const { awaitProxyName } = microservice.createProxies({
      proxies: [{
          serviceDefinition: remoteServiceDefinition,
          proxyName: 'awaitProxyName',
        },
      ],
      isAsync: true,
});

awaitProxyName.then(({proxy}) => {
  proxy.hello('ME').then(console.log) // Hello ME
});
```

##### example of resolving the proxy immediately

```typescript
// isAsync: false so createProxies will return a map of <proxyName: Proxy(service)>
// this way we are able to request for multiple proxies in 1 function.
// in this example we are not sure if the service is available to use.
const { proxyName } = microservice.createProxies({
      proxies: [{
          serviceDefinition: remoteServiceDefinition,
          proxyName: 'proxyName',
        },
      ],
      // isAsync: false, 
});

proxyName.hello('ME').then(console.log) // Hello ME
```

##### example of resolving the single proxy immediately

```typescript
// createProxy will return a Proxy(service)
// in this example we are not sure if the service is available to use.
const { proxyName } = microservice.createProxy({
    serviceDefinition: remoteServiceDefinition
});

proxyName.hello('ME').then(console.log) // Hello ME
```
