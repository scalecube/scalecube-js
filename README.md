[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> **NOTICE** versions 0.0.x are experimental without LTS or the API and behavior might change from patch to patch

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/39bc4219854c4de09abf28a920a474ad)](https://www.codacy.com/app/ido/scalecube-js?utm_source=github.com&utm_medium=referral&utm_content=scalecube/scalecube-js&utm_campaign=Badge_Grade)

# Scalecube

Scalecube is a toolkit for creating microservices based systems.  
Scalecube provides tools like:  
[Microservice](packages/scalecube-microservice/README.md),  
[Router](packages/routers/README.md),  
[Discovery](packages/scalecube-discovery/README.md),  
[Transport-browser](packages/transport-browser/README.md),  
[Transport-nodejs](packages/transport-nodejs/README.md),  
[Gateway](packages/rsocket-ws-gateway/README.md),  
[Cluster-browser](packages/cluster-browser/README.md),  
[Cluster-nodejs](packages/cluster-nodejs/README.md).

## Basic Usage

npm:

```text
npm install @scalecube/scalecube-microservice
```

yarn:

```text
yarn add @scalecube/scalecube-microservice
```

### Usage

**provider side** - create the service & publish it.

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';
const microserviceInstance = createMicroservice({
  services: [{
        definition: greetingsDefinition,
        reference: { hello : (name) => `Hello ${name}!` }
  }],
  address : 'remoteService1'
});
```

**consumer side** - use the service.

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';
const greetingService = createMicroservice({
  seedAddress : 'remoteService1'
}).createProxy({  serviceDefinition: greetingsDefinition });
greetingService.hello('Me').then(console.log) // 'Hello Me!'
```

The service can be written and re-written in every available technology.  
it can be run in workers, browser or server.  
Scalecube provide us a way to publish the service from any platform and consume the service at any plaform without any additional code.

For more details how to use it see [scalecube basic usage](packages/scalecube-microservice/README.md)

## Project Status

currently we are working on version 0.2.x
and it will be the first version with LTS (meaning the API will be backwards compatible until the major will change).  
The SLA is still under debate and will be release as part of 0.2.x  
for more details about 0.2.x go to <https://github.com/scalecube/scalecube-js/issues/30>

## Version

-   [semver format](http://semver.org/)

**MAJOR** version when you make incompatible API changes,

**MINOR** version when you add functionality in a backwards-compatible manner, and

**PATCH** version when you make backwards-compatible bug fixes.

<!--

Working with microservices allow you:
- **Scale-up** 
  - Scale develop capacity as your team grow.
- **Technology agnostic**
  - Avoiding tight-coupling between service implementation and technology.
 
With Scalecube it is also possible to create monolith,
and change to microservice architecture when you are ready to scale.




## Problems microservice solves:

- Have you ever wanted to replace only part of your code as technology progress?
- Have you ever had to develop the same (or similar) logic multiple times?
- Have you ever had hard integration process between different teams?

#### Solve integration problem
Develop capacity scale as your team grows,

but the integration between features/ change requests/ etc.. become harder.

Scalecube approach for solving this problem:
- define API for a service.
- service must implement the given API.

After service is defined, it is possible for the service provider and the service consumer to work independently.

- once the service is production-ready the consumer doesn't need to have any integration phase. 

#### Solve technology block
Changing technology is never easy but almost always necessary.

It is common that js libraries developed/changed over time.

working with micro-services you will be able to replace/update small part of your code.

with Scalecube you will be able to take it one step further.

it will be possible to change the service between backEnd technology and frontEnd technology.
-->
