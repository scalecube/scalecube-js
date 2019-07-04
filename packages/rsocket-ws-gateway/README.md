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

```typescript
import { Microservices, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '@scalecube/rsocket-ws-gateway';

class ServiceA {
  public method1() {
    return Promise.resolve({ id: 1 });
  }
}
const definition = {
  serviceName: 'serviceA',
  methods: {
    method1: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const gateway = new Gateway({ port: 3000 });
const ms = Microservices.create({
  services: [{ definition, reference: new ServiceA() }],
  gateway,
});
```
