[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> This is part of [scalecube-js](https://github.com/scalecube/scalecube-js) project, see more at <https://github.com/scalecube/scalecube-js>  
> [Full documentation](http://scalecube.io/javascript-docs)

# Microservices-browser

This package provides Scalecube's solution with default setting for working in node.

### Usage

`yarn add @scalecube/node` or `npm i @scalecube/node`  

```typescript
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/node';
```

**create a seed**

```typescript
export const MySeedAddress: 'ws://localhost:8000';

// Create a service
createMicroservice({
   address : MySeedAddress
});
```

**Create a service**

```typescript
// Create service definition
export const greetingServiceDefinition = {
  serviceName: 'GreetingService',
  methods: { 
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    }
  },
};
// Create a service
createMicroservice({
  service : [{
    definition: greetingServiceDefinition,
    reference: {
      hello : (name) => `Hello ${name}`
    }, 
   }],
   seedAddress : MySeedAddress,
   address : 'ws://localhost:8001'
});
```

**Use a service**

```typescript
const microservice = createMicroservice({
    seedAddress : MySeedAddress,
    address : 'ws://localhost:8002'
})

// With proxy
const greetingService = microservice.createProxy({
    serviceDefinition: greetingServiceDefinition
});

greetingService.hello('ME').then(console.log) // Hello ME
```

**Dependency Injection**

```typescript
createMicroservice({
  seedAddress : MySeedAddress,
  address : 'ws://localhost:8003',
  services: [
    {
      definition: serviceB,
      reference: ({ createProxy, createServiceCall }) => {
        const greetingService = createProxy({serviceDefinition: greetingServiceDefinition });

        return new ServiceB(greetingService);
      }
    }    
  ]
})
```

## documentation

please [Read](http://scalecube.io/javascript-docs) before starting to work with scalecube.
