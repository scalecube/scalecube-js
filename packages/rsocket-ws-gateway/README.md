[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> This is part of [scalecube-js](https://github.com/scalecube/scalecube-js) project, see more at <https://github.com/scalecube/scalecube-js>  
> [Full documentation](http://scalecube.io/javascript-docs)

# rsocket-websocket-gateway

This package provides gateway implementation for NodeJS based on rsocket websocket

# API

```typescript
interface Gateway {
  constructor(options: {port: number, requestResponse?: RequestHandler, requestStream?: RequestHandler});
  start: (options: { serviceCall: ServiceCall }) => void;
  stop: () => void;
}
```

# Usage

## Server side

```typescript
import { createMicroservice } from '@scalecube/scalecube-microservice';
import { Gateway } from '@scalecube/rsocket-ws-gateway';

const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const reference = { methodA: () => Promise.resolve('ok') };
const services = [{ definition, reference }];
const ms = createMicroservice({ services });
const serviceCall = ms.createServiceCall({});
const gateway = new Gateway({ port: 3000 });
gateway.start({ serviceCall });
```

## Client side

```typescript
import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway/dist/createGatewayProxy';


const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
  const proxy = await createGatewayProxy('ws://localhost:3000', definition);
  const resp = await proxy.methodA() // => 'ok'
```
