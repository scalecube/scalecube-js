/*****
 * This file contains scenarios for failed attempts to create a microService is created.
 * 1. All tests result in the same 'getServiceIsNotValidError' error message, detailed below.
 * 2. microService contains definition + reference. We include here scenarios for various validation of both.
 * 3. Included also validation tests for asyncModel.
 *****/

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
  // #1 - definition has a method that is not contained in the reference.
  const scenario1service = {
    definition: {
      ...baseServiceDefinition,
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
    reference: {},
  };
  // #2 - definition has a method that is not contained in the reference.
  const scenario2service = {
    definition: {
      ...baseServiceDefinition,
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
    },
    reference: {},
  };
  // #3 - method is not object with a key 'asyncModel'
  const scenario3service = {
    definition: {
      ...baseServiceDefinition,
      hello: null,
    },
    reference: {},
  };
  // #4 - asyncModel is not ${ASYNC_MODEL_TYPES.REQUEST_RESPONSE} or ${ASYNC_MODEL_TYPES.REQUEST_STREAM}
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
  `
      Background:
        Given   a service with definition and reference
        And     definition and reference comply with each other

      Scenario: Fail to register a service, invalid definition
        When    microService is called with 'definition' values
                |definition |
                |string     |
                |-100       |
                |0          |
                |1          |
                |100.1      |
                |1 10       |
                |test       |
                |{}         |
                |[]         |
                |undefined  |
                |null       |
      
      Scenario: Fail to register a service, invalid async model
        When    definition includes AsyncModel
        And     'AsyncModel' includes RequestResponse|RequestStream
                |AsyncModel |
                |string     |
                |-100       |
                |0          |
                |1          |
                |100.1      |
                |1 10       |
                |test       |
                |{}         |
                |[]         |
                |undefined  |
                |null       |

      Feature:  Validation testing for a proxy created from a Microservice

      Scenario: Create a proxy from Microservice successfuly.
        Given    a service with definition and reference
        And      'definition' and 'reference' comply with each other
                |service          |definition              |reference               |
                |greetingService  |hello: RequestResponse  |hello: RequestResponse  |
                |                 |greet$: RequestStream   |greet$: RequestStream   |
        When    creating a Microservice with the service
        Then    greetingServiceProxy is created from the Microservice

      Background:
        Given   a Microservice
        And      definition and reference
        And      definition comply with reference
                |service          |definition              |reference               |
                |greetingService  |hello: RequestResponse  |hello: RequestResponse  |
                |                 |greet$: RequestStream   |greet$: RequestStream   |  

      Scenario: Invoke a method that is defined in the serviceDefinition (requestResponse)
        When    proxy is created from the Microservice
        And     proxy tries to invoke method 'hello: RequestResponse' from serviceDefinition
        Then    greetingServiceProxy will be invoked from the Microservice   

      Scenario: Invoke a method that is defined in the serviceDefinition (requestResponse)
        When    proxy is created from the Microservice
        And     proxy tries to invoke method 'hello: RequestStream' from serviceDefinition
        Then    greetingServiceProxy will be invoked from the Microservice

                  
    `;
});

// TODO : silent failing scenario
// #3. definition: method invalid format          | greetingService | hello: null               |           |
// #4. definition: asyncModel unsupported format  | greetingService | hello:{asyncModel: null } |           |
