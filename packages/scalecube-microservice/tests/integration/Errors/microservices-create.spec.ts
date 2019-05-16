/*****
 * This file contains scenarios for failed attempts to create a microservice.
 * 1. All tests result in the same 'getServiceIsNotValidError' error message, detailed below.
 * 2. microservice create from a service, service contains definition + reference.
 * 3. We include here scenarios for various validation for definition.
 *****/

import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/lib/helpers/types';
import { getGlobalNamespace } from '../../../src/helpers/utils';
import { ASYNC_MODEL_TYPES, Microservices } from '../../../src';
import {
  getInvalidMethodReferenceError,
  getMethodsAreNotDefinedProperly,
  getServiceNameInvalid,
  SERVICES_IS_NOT_ARRAY,
} from '../../../src/helpers/constants';
import { getQualifier } from '../../../src/helpers/serviceData';

describe('Test the creation of Microservice', () => {
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

  // @ts-ignore
  test.each([[], {}, Symbol()])(
    `
     Scenario: serviceDefinition with invalid 'serviceName' value
        Given invalid 'serviceName' value
        When    creating a microservice
          And   serviceDefinition has invalid 'serviceName' values

                |definition      | value
                |array           | []
                |object          | {}
                |symbol          | Symbol()

        Then    invalid service error will occur
      `,
    (serviceName) => {
      const service = {
        definition: {
          serviceName,
        },
        reference: {},
      };

      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(getServiceNameInvalid());
      }
    }
  );

  // @ts-ignore
  test.each(['string', -100, 10, 0, 1, 10.1, [], {}, undefined, null, Symbol('10')])(
    `
     Scenario: serviceDefinition with invalid 'method' value
        Given invalid 'method' value
        When    creating a microservice
          And   serviceDefinition has invalid 'method' values

                |definition      | value
                |string          | 'string'
                |negative number | -100
                |number          | 10
                |false convert   | 0
                |true convert    | 1
                |double          | 10.1
                |array           | []
                |object          | {}
                |undefined       | undefined
                |null            | null
                |symbol          | Symbol('10')

        Then    invalid service error will occur
      `,
    (methodValue) => {
      const service = {
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
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(
          getMethodsAreNotDefinedProperly(service.definition.serviceName, Object.keys(service.definition.methods))
        );
      }
    }
  );

  // @ts-ignore
  test.each(['string', -100, 0, 1, 10.1, [], {}, undefined, null, Symbol()])(
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
                |Symbol          | Symbol()

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
        expect(error.message).toMatch(
          getMethodsAreNotDefinedProperly(service.definition.serviceName, Object.keys(service.definition.methods))
        );
      }
    }
  );

  test.each([() => {}, null, undefined, 'hello', 3, true, false, []])(
    `
    Scenario: Testing reference format

        type      |	value                   |
        function  |	const hello = ()=>{}	  |
        null	    | const hello = null	    |
        undefined |	const hello = undefined	|
        string    | const hello = 'hello'   |
        number    | const hello = 3         |
        boolean   | const hello = true      |
        boolean   | const hello = false     |
        array     | const hello = []        |

      Given a reference for 'hello service' of  type 'value'
      And a definition with 'hello service'
      When creating a microservice
      Then exception will occur: definition has a method but the reference is not a function.
      `,
    (helloService) => {
      const service = {
        definition: {
          ...baseServiceDefinition,
          methods: {
            hello: {
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
            },
          },
        },
        reference: helloService,
      };

      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(
          getInvalidMethodReferenceError(
            getQualifier({ serviceName: baseServiceDefinition.serviceName, methodName: 'hello' })
          )
        );
      }
    }
  );

  // @ts-ignore
  test.each(['test', '', 0, 1, true, false, -100, 10, 10.1, {}, null])(
    `
     Scenario:  service not of type array
        Given   a 'service'
        And     using it as 'service'.
        When    creating a Microservice from the 'service'
        Then    exception will occur.
          
                |definition      | value
                |string          | 'test'
                |empty string    | ''
                |number false    | 0
                |number true     | 1
                |boolean         | true
                |boolean         | false
                |negative number | -100
                |positive number | 10
                |double          | 10.1
                |object          | {}
                |null            | null
                
        Then    invalid service error will occur
      `,
    (services) => {
      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services });
      } catch (error) {
        expect(error.message).toMatch(SERVICES_IS_NOT_ARRAY);
      }
    }
  );
});

// TODO : silent failing scenario
