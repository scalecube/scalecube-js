[![Join the chat at https://gitter.im/scalecube-js/Lobby](https://badges.gitter.im/scalecube-js/Lobby.svg)](https://gitter.im/scalecube-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

> This is part of [scalecube-js](https://github.com/scalecube/scalecube-js) project, see more at <https://github.com/scalecube/scalecube-js>  
> [Full documentation](http://scalecube.io/javascript-docs)

# rsocket-websocket-gateway-client

Client for rsocket websocket gateway for browser and server usage

```typescript
import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway-client';


const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
  const proxy = await createGatewayProxy('ws://localhost:3000', definition);
  const resp = await proxy.methodA() // => 'ok'
```
