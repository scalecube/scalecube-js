# Scalecube-js

Scalecube is a toolkit for creating microservices/micro-frontends based systems.  
[what is scalecube-js](https://idanilt.medium.com/scalecube-js-2785c491ae54) | [play with codesandbox](https://codesandbox.io/s/scalecube-full-tutorial-yjjvu?file=/package.json) | [full documentation](https://scalecube.github.io/javascript-docs)

[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/39bc4219854c4de09abf28a920a474ad)](https://www.codacy.com/app/ido/scalecube-js?utm_source=github.com&utm_medium=referral&utm_content=scalecube/scalecube-js&utm_campaign=Badge_Grade)

> ### Project Status
>
> [Scalecube v0.2.x](https://github.com/scalecube/scalecube-js/issues/30) is stable, the API will be supported until 1.1.2022.  
> We want to collect feedback from the community before releasing 1.x.x but we don't foresee any majors API change.  
> If you have any feedback please [open issue](https://github.com/scalecube/scalecube-js/issues) or talk with us on [gitter](https://gitter.im/scalecube-js/Lobby)

## quick start
> If you are new to scalecube, it's recommended to read [this introduction to scalecube](https://idanilt.medium.com/scalecube-js-2785c491ae54).  

Scalecube provide browser and NODE templates, configured and ready for use

### [Browser](packages/browser/README.md)

`yarn add @scalecube/browser` or `npm i @scalecube/browser`

```typescript
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/browser';
```

### [Node](packages/node/README.md)

`yarn add @scalecube/node` or `npm i @scalecube/node`

```typescript
import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/node';
```

### Advanced

You can create your own customized setup, for more details: go to [Microservice](packages/scalecube-microservice/README.md) 

### Usage (Browser and node)

#### create a seed

```typescript
// node - supported WS, WSS and TCP
export const MySeedAddress: 'ws://localhost:8000';
// Browser - under browser post message will be used as transport
export const MySeedAddress: 'seed';

// Create a service
createMicroservice({
   address : MySeedAddress
});
```

#### Create a service

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
  services : [{
    definition: greetingServiceDefinition,
    reference: {
      hello : async (name) => `Hello ${name}`
    }, 
   }],
   seedAddress : MySeedAddress
});
```

#### Use a service

```typescript
const microservice = createMicroservice({seedAddress : MySeedAddress})

// With proxy
const greetingService = microservice.createProxy({
    serviceDefinition: greetingServiceDefinition
});

greetingService.hello('ME').then(console.log) // Hello ME
```

\*We let Scalecube choose our addresses for us, we know only the seed address.  
After we connected to the seed we will see the whole cluster.
In the browser we don't need to import modules, we can create multiple bundles, scalecube will discover the available services

**\*NOTICE** For Node you have to set addresses, there isn't any default at the moment

#### Worker, Iframes and seperate bundles 

You can use scalecube with multiple bundles even inside iframes and *Web Workers, scalecube will be able to find and invoke the services by the address and seedAddress (via Post Messages).

**\*NOTICE** In order to use Web Workers you need to load scalecube before loading the Web Worker (scalecube extends Worker class)

**Good**
```typescript
import from "@scalecube/browser";

new Worker(`assets/worker.js`, {
  type: "module"
});
```

**Bad**
```typescript
new Worker(`assets/worker.js`, {
  type: "module"
});
```


#### Dependency Injection
You can pass a function instead of object as the reference, this function get `createProxy` and `createServiceCall`, which can help you invoke any service in the cluster. The function need to return object with all the service methods (`[methodName]: function()`).  
In the example bellow, we are creating a new instance of a class, but you can do in anyway you want.

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

For more examples go to [examples](packages/examples) or [full documentation](https://scalecube.github.io/javascript-docs)

## Scalecube tools

[Router](packages/routers/README.md),  
[Discovery](packages/scalecube-discovery/README.md),  
[Transport-browser](packages/transport-browser/README.md),  
[Transport-nodejs](packages/transport-nodejs/README.md),  
[Gateway](packages/rsocket-ws-gateway/README.md),  
[Cluster-browser](packages/cluster-browser/README.md),  
[Cluster-nodejs](packages/cluster-nodejs/README.md).

## Version

-   [semver format](http://semver.org/)

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.
