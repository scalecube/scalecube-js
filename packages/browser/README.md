[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> This is part of [scalecube-js](https://github.com/scalecube/scalecube-js) project, see more at https://github.com/scalecube/scalecube-js  
> [Full documentation](http://scalecube.io/javascript-docs)

# Microservices-browser

This package provides Scalecube's solution with default setting for working in browsers.

### Usage

`yarn add @scalecube/browser` or `npm i @scalecube/browser`  

```typescript
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/browser';
```

**create a seed**

```typescript
export const MySeedAddress: 'seed';

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
   seedAddress : MySeedAddress
});
```

**Use a service**

```typescript
const microservice = createMicroservice({seedAddress : MySeedAddress})

// With proxy
const greetingService = microservice.createProxy({
    serviceDefinition: greetingServiceDefinition
});

greetingService.hello('ME').then(console.log) // Hello ME
```

We let Scalecube choose our addresses for us, we know only the seed address.  
After we connected to the seed we will see the whole cluster.
In the browser we don't need to import modules, we can create multiple bundles, scalecube will discover the available services

**Dependency Injection**

```typescript
createMicroservice({
  seedAddress : MySeedAddress,
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

## Old browser supports

this package already transpile the code to es5.

for old browser support please add:

-   babel-polyfill
-   proxy-polyfill

```html
 <script nomodule src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.6.0/polyfill.min.js"></script>
 <script nomodule src="https://cdn.jsdelivr.net/npm/proxy-polyfill@0.3.0/proxy.min.js"></script>
```
