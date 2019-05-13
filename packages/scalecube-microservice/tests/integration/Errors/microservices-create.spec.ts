/*****
 * This file contains scenarios for failed attempts to create a microservice.
 * 1. All tests result in the same 'getServiceIsNotValidError' error message, detailed below.
 * 2. microservice create from a service, service contains definition + reference.
 * 3. We include here scenarios for various validation for definition.
 *****/

import { getGlobalNamespace } from '../../../src/helpers/utils';
import { ASYNC_MODEL_TYPES, Microservices } from '../../../src';
import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/lib/helpers/types';
import { getInvalidMethodReferenceError, getServiceIsNotValidError } from '../../../src/helpers/constants';
import { getQualifier } from '../../../src/helpers/serviceData';

describe('Test the creation of Microservice', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  beforeEach(() => {
    getGlobalNamespace().scalecube = {} as ScalecubeGlobal;
  });

  const baseServiceDefinition = {
    serviceName: 'GreetingService',
  };
  // #1 - definition has a method that is not contained in the reference.
  const scenario1service = {
    definition: {
      ...baseServiceDefinition,
      methods: {
        hello: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        },
      },
    },
    reference: {},
  };
  // #2 - definition has a method that is not contained in the reference.
  const scenario2service = {
    definition: {
      ...baseServiceDefinition,
      methods: {
        hello: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
        },
      },
    },
    reference: {},
  };

  const qualifier = getQualifier({ serviceName: baseServiceDefinition.serviceName, methodName: 'hello' });

  test.each([
    {
      service: scenario1service,
      exceptionMsg: getInvalidMethodReferenceError(qualifier),
    },
    {
      service: scenario2service,
      exceptionMsg: getInvalidMethodReferenceError(qualifier),
    },
  ])(
    `
      Scenario: Fail to register a service, 
        Given   'serviceData' with 'service' and 'exceptionMsg'
          scenario                                 |service         |definition               | reference |
          #1. definition does not match reference  |greetingService |hello : REQUEST_RESPONSE |           |
          #2. definition does not match reference  |greetingService |hello : REQUEST_STREAM   |           |
        
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

  test.each(['string', -100, 0, 1, 10.1, [], {}, undefined, null])(
    `
     Scenario: serviceDefinition with invalid 'method' value
        Given invalid 'method' value
        When    creating a microservice 
          And   serviceDefinition has invalid 'method' values
                |definition      | value
                |string          | 'string'
                |negative number | -100
                |false convert   | 0
                |true convert    | 1
                |double          | 10.1
                |array           | []
                |object          | {}
                |undefined       | undefined
                |null            | null
        Then    invalid service error will occur
      `,
    (methodValue) => {
      const scenario3service = {
        definition: {
          ...baseServiceDefinition,
          methods: {
            hello: methodValue,
          },
        },
        reference: {},
      };

      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [scenario3service] });
      } catch (error) {
        expect(error.message).toMatch(getServiceIsNotValidError(baseServiceDefinition.serviceName));
      }
    }
  );

  test.each(['string', -100, 0, 1, 10.1, [], {}, undefined, null])(
    `
     Scenario: serviceDefinition with invalid 'asyncModel' values
        Given invalid 'asyncModel' value
        When    creating a microservice 
          And   serviceDefinition has invalid 'asyncModel' values
                |definition      | value
                |string          | 'string'
                |negative number | -100
                |false convert   | 0
                |true convert    | 1
                |double          | 10.1
                |array           | []
                |object          | {}
                |undefined       | undefined
                |null            | null
        Then    invalid service error will occur
      `,
    (asyncModel) => {
      const service = {
        definition: {
          ...baseServiceDefinition,
          methods: {
            hello: {
              asyncModel,
            },
          },
        },
        reference: {},
      };

      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(getServiceIsNotValidError(baseServiceDefinition.serviceName));
      }
    }
  );
});

// TODO : silent failing scenario
