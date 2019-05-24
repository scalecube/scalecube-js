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
  getIncorrectMethodValueError,
  getInvalidAsyncModelError,
  getServiceNameInvalid,
  SERVICES_IS_NOT_ARRAY,
  SERVICE_IS_NOT_OBJECT,
  SERVICE_NAME_NOT_PROVIDED,
  SEED_ADDRESS_IS_NOT_STRING,
  getAsynModelNotProvidedError,
  getInvalidServiceReferenceError,
  getServiceReferenceNotProvidedError,
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

  test(`
    Scenario: Service name is not provided in service definition

      Given Service definition without serviceName
      And a definition with 'hello service'
      When creating a microservice
      Then exception will occur: serviceDefinition.serviceName is not defined
`, () => {
    expect.assertions(1);
    const service = {
      definition: {
        methods: {
          hello: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
          },
        },
      },
      reference: {},
    };
    try {
      // @ts-ignore
      Microservices.create({ services: [service] });
    } catch (error) {
      expect(error.message).toMatch(SERVICE_NAME_NOT_PROVIDED);
    }
  });
  // @ts-ignore
  test.each([[], {}, false, true, 10, null, Symbol()])(
    `
     Scenario: serviceDefinition with invalid 'serviceName' value
        Given invalid 'serviceName' value
        When    creating a microservice
          And   serviceDefinition has invalid 'serviceName' values

                |definition      | value
                |array	         | []
                |object	         | {}
                |boolean	 | false
                |boolean	 | true
                |number	         | 10
                |null	         | null
                |symbol	         | Symbol()

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
        expect(error.message).toMatch(getServiceNameInvalid(serviceName));
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
        expect(error.message).toMatch(getIncorrectMethodValueError(qualifier));
      }
    }
  );

  test(`
    Scenario: Async model not provided

      Given Service definition
      And no async model provided for hello method
      When creating a microservice
      Then exception will occur: Async model is not provided in service definition for service/method.
`, () => {
    expect.assertions(1);
    const service = {
      definition: {
        ...baseServiceDefinition,
        methods: {
          hello: {
            noAsyncModel: 'xxx',
          },
        },
      },
      reference: {},
    };
    try {
      // @ts-ignore
      Microservices.create({ services: [service] });
    } catch (error) {
      expect(error.message).toMatch(getAsynModelNotProvidedError(qualifier));
    }
  });
  // @ts-ignore
  test.each(['string', -100, 0, 1, 10.1, [], {}, null, Symbol()])(
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
                |null            | null
                |Symbol          | Symbol()

        Then    exeption will occur: Invalid async model in service definition for ${qualifier}
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
        expect(error.message).toMatch(getInvalidAsyncModelError(qualifier));
      }
    }
  );

  test(`
    Scenario: Service reference not provided

      Given Service reference is not provided
      And a definition with 'hello service'
      When creating a microservice
      Then exception will occur: service reference is not defined.
`, () => {
    expect.assertions(1);
    const service = {
      definition: {
        ...baseServiceDefinition,
        methods: {
          hello: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
          },
        },
      },
      // no reference
    };
    try {
      // @ts-ignore
      Microservices.create({ services: [service] });
    } catch (error) {
      expect(error.message).toMatch(getServiceReferenceNotProvidedError(baseServiceDefinition.serviceName));
    }
  });
  test.each([() => {}, null, 'hello', 3, true, false, []])(
    `
    Scenario: Testing reference format

        type      |	value               |
        function  | const hello = ()=>{}    |
        null	  | const hello = null	    |
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
        expect(error.message).toMatch(getInvalidServiceReferenceError(baseServiceDefinition.serviceName));
      }
    }
  );

  test.each([null, 'hello', 3, true, false, []])(
    `
    Scenario: Testing service reference method format

        type      |	value               |
        null	  | const hello = null	    |
        undefined |const hello = undefined  |
        string    | const hello = 'hello'   |
        number    | const hello = 3         |
        boolean   | const hello = true      |
        boolean   | const hello = false     |
        array     | const hello = []        |

      Given a reference  for 'hello service' with hello method of  type 'value'
      And a definition with 'hello service'
      When creating a microservice
      Then exception will occur: definition has a method but the reference is not a function.
      `,
    (hello) => {
      const service = {
        definition: {
          ...baseServiceDefinition,
          methods: {
            hello: {
              asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
            },
          },
        },
        reference: { hello },
      };

      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(getInvalidMethodReferenceError(qualifier));
      }
    }
  );
  // @ts-ignore
  test.each(['test', '', 0, 1, true, false, -100, 10, 10.1, {}, null])(
    `
     Scenario:  services not of type array
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
  // @ts-ignore
  test.each([null, undefined])(
    `
     Scenario:  service is null or undefined
        Given   a 'service'
        And     using it as 'service'.
        When    creating a Microservice from the 'service'
        Then    exception will occur.
          
                |service     | value
                |null        | null
                |undefined   | undefined
                
        Then    invalid service error will occur
      `,
    (service) => {
      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [service] });
      } catch (error) {
        expect(error.message).toMatch(SERVICE_IS_NOT_OBJECT);
      }
    }
  );
  // @ts-ignore
  test.each([null, undefined])(
    `
     Scenario:  microservice options is null or undefined
        Given   a 'microserviceOptions'
        And     using it as 'microserviceOptions'.
        When    creating a Microservice from the 'microserviceOptions'
        Then    no error thrown and microservice instantiates with default options
          
                |microserviceOptions     | value
                |null                    | null
                |undefined               | undefined
                
        Then    invalid service error will occur
      `,
    (microserviceOptions) => {
      expect.assertions(1);
      expect(() => Microservices.create(microserviceOptions)).not.toThrow();
    }
  );
  test.each([[], {}, false, true, 10, null, Symbol(), new class {}()])(
    `
     Scenario: microservise option  with invalid seedAddress value
        Given   a 'microserviceOptions'
        And     seedAddress has invalid value

                |definition      | value
                |array	         | []
                |object	         | {}
                |boolean	 | false
                |boolean	 | true
                |number	         | 10
                |null	         | null
                |symbol	         | Symbol()
                |new class       | new class{}

        When    creating a microservice
        Then    exception will occur: seed address should be non empty string
      `,
    (seedAddress) => {
      expect.assertions(1);
      try {
        // @ts-ignore
        Microservices.create({ services: [], seedAddress });
      } catch (error) {
        expect(error.message).toMatch(SEED_ADDRESS_IS_NOT_STRING);
      }
    }
  );
});

// TODO : silent failing scenario
