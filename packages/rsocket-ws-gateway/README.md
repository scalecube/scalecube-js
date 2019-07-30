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
import { createMicroservice } from '@scalecube/scalecube-microservice';
import { Gateway } from '@scalecube/rsocket-ws-gateway';

const gateway = new Gateway({ port: 3000 });
const ms = createMicroservice();
const serviceCall = ms.createServiceCall({});
gateway.start({ serviceCall });
```
