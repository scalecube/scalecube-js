import { getGlobalNamespace } from '../../../src/helpers/utils';
import { ASYNC_MODEL_TYPES, Microservices } from '../../../src';
import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/lib/helpers/types';
import { getServiceIsNotValidError } from '../../../src/helpers/constants';

describe('Test the creation of Microservice', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  beforeEach(() => {
    getGlobalNamespace().scalecube = {} as ScalecubeGlobal;
  });

  const baseServiceDefinition = {
    serviceName: 'GreetingService',
  };
  //           #1 - definition has a method that is not contained in the reference.
  const scenario1service = {
    definition: {
      ...baseServiceDefinition,
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
    reference: {},
  };
  //           #2 - definition has a method that is not contained in the reference.
  const scenario2service = {
    definition: {
      ...baseServiceDefinition,
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
    },
    reference: {},
  };
  //           #3 - method is not object with a key 'asyncModel'
  const scenario3service = {
    definition: {
      ...baseServiceDefinition,
      hello: null,
    },
    reference: {},
  };
  //           #4 - asyncModel is not ${ASYNC_MODEL_TYPES.REQUEST_RESPONSE} or ${ASYNC_MODEL_TYPES.REQUEST_STREAM}
  const scenario4service = {
    definition: {
      ...baseServiceDefinition,
      hello: {
        asyncModel: null,
      },
    },
    reference: {},
  };

  test.each([
    {
      service: scenario1service,
      exceptionMsg: getServiceIsNotValidError(baseServiceDefinition.serviceName),
    },
    {
      service: scenario2service,
      exceptionMsg: getServiceIsNotValidError(baseServiceDefinition.serviceName),
    },
    {
      service: scenario3service,
      exceptionMsg: getServiceIsNotValidError(baseServiceDefinition.serviceName),
    },
    {
      service: scenario4service,
      exceptionMsg: getServiceIsNotValidError(baseServiceDefinition.serviceName),
    },
  ])(
    `
      Scenario: Fail to register a service, 
        Given  'serviceData' with 'service' and 'exceptionMsg'
          scenario                                   | service         | definition                                    | reference |
          #1. definition does not match reference    | greetingService | hello : REQUEST_RESPONSE |           |
          #2. definition does not match reference    | greetingService | hello : REQUEST_STREAM  |           |
          #3. definition: method invalid format      | greetingService | hello: null                                   |           |
          #4. definition: asyncModel unsupported format  | greetingService | hello:{asyncModel: null }                     |           |
        
        When creating microservice with a given 'service'
        Then an exception will occur.
        `,
    (serviceData) => {
      const { service, exceptionMsg } = serviceData;

      expect.assertions(1);
      try {
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(exceptionMsg);
      }
    }
  );
});

// TODO : silent failing scenario
