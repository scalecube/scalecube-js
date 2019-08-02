import { createMicroservice, ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice';
import { Gateway } from '../src/Gateway';
import { createGatewayProxy } from '../src/createGatewayProxy';

const definitionA = {
  serviceName: 'serviceA',
  methods: {
    methodA: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const definitionB = {
  serviceName: 'serviceB',
  methods: {
    methodB: { asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE },
  },
};
const serviceA = { methodA: () => Promise.resolve('ok') };
const serviceB = { methodB: () => Promise.resolve('bye') };
const services = [{ definition: definitionA, reference: serviceA }, { definition: definitionB, reference: serviceB }];

const ms = createMicroservice({ services });
const serviceCall = ms.createServiceCall({});
const gateway = new Gateway({ port: 8080 });
gateway.start({ serviceCall });

let proxyA;
let proxyB;

beforeAll(async () => {
  [proxyA, proxyB] = await createGatewayProxy('ws://localhost:8080', [definitionA, definitionB]);
});
afterAll(() => gateway.stop());

test(`Given microservices with gateway
    And   two service 
    And   two gateway-proxies created simultanously by createGatewayProxy method
    When  two requests executed through those proxies
    Then  two success responses returned by both of proxies`, async () => {
  const respA = await proxyA.methodA();
  expect(respA).toEqual('ok');
  const respB = await proxyB.methodB();
  expect(respB).toEqual('bye');
  gateway.stop();
});
