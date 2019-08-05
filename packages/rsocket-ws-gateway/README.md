# rsocket-websocket-gateway

This package provides gateway implementation for NodeJS based on rsocket websocket

# API

```typescript
interface Gateway {
  constructor(options: {port: number});
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
