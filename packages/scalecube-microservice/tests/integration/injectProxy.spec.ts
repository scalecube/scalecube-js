import { createMicroservice, ASYNC_MODEL_TYPES } from '../../src';
import { getQualifier } from '@scalecube/utils';
import { MicroserviceApi } from '@scalecube/api';

test(`
  Scenario: injectProxy of serviceA into ServiceB constructor 
  Given     serviceB with method hello
  And       serviceA with method getDefaultName
  When      creating microservice with serviceA, serviceB
  Then      serviceB reference callback call with createProxy, createServiceCall
  And       serviceB can createProxy for serviceA
  And       serviceB can createServiceCall for serviceA
  And       serviceB.hello response with 'hello defaultName'
`, (done) => {
  expect.assertions(3);

  const definitionA = {
    serviceName: 'serviceA',
    methods: {
      getDefaultName: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const definitionB = {
    serviceName: 'serviceB',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };

  const defaultName = 'defaultName';

  const ms = createMicroservice({
    services: [
      {
        reference: {
          getDefaultName: () => Promise.resolve(defaultName),
        },
        definition: definitionA,
      },
      {
        reference: ({ createProxy, createServiceCall }) => {
          const proxyA = createProxy({ serviceDefinition: definitionA });
          setTimeout(() => {
            proxyA.getDefaultName().then((response: string) => expect(response).toMatch(defaultName));

            const serviceCallA = createServiceCall({});
            serviceCallA
              .requestResponse({
                data: [],
                qualifier: getQualifier({ serviceName: definitionA.serviceName, methodName: 'getDefaultName' }),
              })
              .then((response: MicroserviceApi.Message) => {
                expect(response).toMatch(defaultName);
                done();
              });
          }, 0);

          return {
            hello: () => proxyA.getDefaultName().then((res: string) => `hello ${res}`),
          };
        },
        definition: definitionB,
      },
    ],
  });

  const proxyB = ms.createProxy({ serviceDefinition: definitionB });
  proxyB.hello().then((response: string) => {
    expect(response).toMatch(`hello ${defaultName}`);
  });
});
