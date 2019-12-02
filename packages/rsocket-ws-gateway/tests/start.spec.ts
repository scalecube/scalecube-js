import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/browser';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';
import { SERVICE_CALL_MUST_BE_OBJECT } from '../src/helpers/constants';

const definition = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const reference = { methodA: () => Promise.resolve('ok') };
const services = [{ definition, reference }];

test(`Given microservices with gateway 
    And   a service
    When  a client wants to access the service
    And   the client sends a request to the gateway
    Then  gateway doesn't receive the request`, async () => {
  try {
    const gateway = new Gateway({ port: 8050 });
    // gateway.start({ serviceCall });
    const proxy: any = await createGatewayProxy('ws://localhost:8050', definition);
  } catch (e) {
    expect(e.message).toBe('Connection error');
  }
});

test(` Given microservices with gateway
    And   start method was called without serviceCall argument
Then  a error message 'Gateway start requires "serviceCall" argument should be thrown`, async () => {
  const gateway = new Gateway({ port: 8051 });
  gateway.warn = jest.fn();
  const ms = createMicroservice({});
  const serviceCall = ms.createServiceCall({});
  // @ts-ignore
  expect(() => gateway.start({})).toThrow(Error(SERVICE_CALL_MUST_BE_OBJECT));
});

test(` Given microservices with gateway
    And   start method was called and the microservice start listening
    When  start method is called again	
Then  a message informing that gateway has already been activated is returned`, async () => {
  const gateway = new Gateway({ port: 8052 });
  gateway.warn = jest.fn();
  const ms = createMicroservice({});
  const serviceCall = ms.createServiceCall({});
  gateway.start({ serviceCall });
  gateway.start({ serviceCall });
  expect(gateway.warn).toHaveBeenCalledWith('Gateway is already started');
  gateway.stop();
});

test(`Given microservices with gateway
    And   start method was called and the microservice start listening 
    And   stop method was called 
    When  start method is called again and microservice starts listening
    And   a request is coming to the gateway
    Then  microservice starts to listen to requests again 
    And   microservice handles the incoming request`, async () => {
  const ms = createMicroservice({ services });
  const serviceCall = ms.createServiceCall({});
  const gateway = new Gateway({ port: 8053 });
  gateway.start({ serviceCall });
  gateway.stop();
  gateway.start({ serviceCall });
  const proxy: any = await createGatewayProxy('ws://localhost:8053', definition);
  const resp = await proxy.methodA();
  expect(resp).toEqual('ok');
  gateway.stop();
});
