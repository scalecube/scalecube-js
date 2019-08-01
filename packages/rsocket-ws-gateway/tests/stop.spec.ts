import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const reference = { methodA: () => Promise.resolve('ok') };
const services = [{ definition, reference }];

test(`Given microservices with gateway
    And   start method was called and the microservice start listening 
    When  stop method is called
    And   the client sends a request to the gateway
    Then  gateway doesn't receive the request`, async () => {
  const ms = createMicroservice({ services });
  const serviceCall = ms.createServiceCall({});
  const gateway = new Gateway({ port: 8080 });
  gateway.start({ serviceCall });
  const proxy: any = await createGatewayProxy('ws://localhost:8080', definition);
  const resp = await proxy.methodA();
  expect(resp).toEqual('ok');
  gateway.stop();
  return proxy.methodA().catch((e) => {
    expect(e.message).toBe('RSocketWebSocketClient: Socket closed unexpectedly.');
  });
});

test(`Given microservices with gateway
    And   start method was called and the microservice start listening 
    And   stop method is called and gateway stopped receiving requests
    When  stop method is called again
    Then  a message informing that gateway is not active is returned`, async () => {
  const gateway = new Gateway({ port: 8080 });
  gateway.warn = jest.fn();
  const ms = createMicroservice({});
  const serviceCall = ms.createServiceCall({});
  gateway.start({ serviceCall });
  gateway.stop();
  gateway.stop();
  expect(gateway.warn).toHaveBeenCalledWith('Gateway is already stopped');
});
