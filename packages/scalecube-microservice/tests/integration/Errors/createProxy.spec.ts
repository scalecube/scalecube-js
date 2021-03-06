/*****
 * This file contains scenarios for failed attempts when using createProxy method.
 * 1. Included validation tests for createProxy.
 * 2. Related issue in GitHub
 *    Check validation - proxy - serviceDefinition without serviceName - https://github.com/scalecube/scalecube-js/issues/106
 *    Check validity - proxy - serviceDefinition method format         - https://github.com/scalecube/scalecube-js/issues/104
 *    Check validity - proxy - serviceDefinition asyncModel value      - https://github.com/scalecube/scalecube-js/issues/103
 *****/
import { createMS, createMSNoRouter } from '../../mocks/microserviceFactory';
import { constants as utilsConstants } from '@scalecube/utils';
import { GreetingService, greetingServiceDefinition } from '../../mocks/GreetingService';
import { ROUTER_NOT_PROVIDED } from '../../../src/helpers/constants';
import { retryRouter } from '@scalecube/routers';

const {
  DEFINITION_MISSING_METHODS,
  INVALID_METHODS,
  SERVICE_NAME_NOT_PROVIDED,
  getIncorrectMethodValueError,
  getServiceNameInvalid,
} = utilsConstants;

describe('validation test for create proxy from microservice', () => {
  const ms = createMS({});

  test(`
    Scenario: Service name is not provided in service definition

      Given Service definition without serviceName
      And     a microservice instance
      When creating a proxy from the microservice with the serviceDefinition
      Then exception will occur: serviceDefinition.serviceName is not defined
`, () => {
    expect.assertions(1);
    const serviceDefinition = {
      // no serviceName
      methods: {},
    };
    try {
      // @ts-ignore
      ms.createProxy({ serviceDefinition });
    } catch (error) {
      expect(error.message).toMatch(SERVICE_NAME_NOT_PROVIDED);
    }
  });
  // @ts-ignore
  test.each(['', [], {}, true, false, 10, null, Symbol()])(
    `
    Scenario: serviceDefinition with invalid 'serviceName' value
    Given     a 'serviceName'
      And     a microservice instance
    When      creating a serviceDefinition with the 'serviceName'
              | type         | 'serviceName' |
              | empty string | ''            |
              | array	       | []            |
              | object	     | {}            |
              | boolean	     | true          |
              | boolean	     | false         |
              | number	     | 10            |
              | null	       | null          |
              | undefined	   | undefined     |
              | symbol	     | Symbol()      |
    And       creating a proxy from the microservice with the serviceDefinition
    Then      exception will occur.`,
    (serviceName) => {
      expect.assertions(1);

      const serviceDefinition = {
        serviceName,
      };

      try {
        // @ts-ignore
        ms.createProxy({ serviceDefinition });
      } catch (e) {
        expect(e.message).toBe(getServiceNameInvalid(serviceDefinition.serviceName));
      }
    }
  );

  // @ts-ignore
  test(`
    Scenario: serviceDefinition without  'methods' 
    Given     a serviceDefinition without a 'methods' key
      And     a microservice instance
    When       creating a proxy from the microservice with the serviceDefinition
    Then      exception will occur: Definition missing methods:object`, () => {
    expect.assertions(1);

    const serviceDefinition = {
      serviceName: 'service',
      // no methods key
    };

    try {
      // @ts-ignore
      ms.createProxy({ serviceDefinition });
    } catch (e) {
      expect(e.message).toBe(DEFINITION_MISSING_METHODS);
    }
  });

  // @ts-ignore
  test.each([[], 'methods', true, false, 10, null, Symbol()])(
    `
    Scenario: serviceDefinition with invalid 'methods' value
    Given     a 'methods'
      And     a microservice instance
    When      creating a serviceDefinition with the 'methods'
              | type       | 'serviceName' |
              | array	     | []            |
              | string	   | 'methods'     |
              | boolean	   | true          |
              | boolean	   | false         |
              | number	   | 10            |
              | null	     | null          |
              | symbol	   | Symbol()      |
    And       creating a proxy from the microservice with the serviceDefinition
    Then      exception will occur.`,
    (methods) => {
      expect.assertions(1);

      const serviceDefinition = {
        serviceName: 'service',
        methods,
      };

      try {
        // @ts-ignore
        ms.createProxy({ serviceDefinition });
      } catch (e) {
        expect(e.message).toBe(INVALID_METHODS);
      }
    }
  );

  // @ts-ignore
  test.each([[], 'methods', true, false, 10, null, undefined, Symbol(), new class {}()])(
    `
    Scenario: serviceDefinition with invalid 'asyncModel' value
    Given     a 'asyncModel'
      And     a microservice instance
    When      creating a serviceDefinition with the 'asyncModel'
              | type       | 'serviceName' |
              | array	     | []            |
              | object	   | {}            |
              | string	   | 'methods'     |
              | boolean	   | true          |
              | boolean	   | false         |
              | number	   | 10            |
              | null	     | null          |
              | undefined	 | undefined     |
              | symbol	   | Symbol()      |
              | class	     | new class{}   |
    And       creating a proxy from the microservice with the serviceDefinition
    Then      exception will occur.`,
    (asyncModel) => {
      expect.assertions(1);

      const serviceDefinition = {
        serviceName: 'service',
        methods: {
          hello: asyncModel,
        },
      };

      try {
        // @ts-ignore
        ms.createProxy({ serviceDefinition });
      } catch (e) {
        expect(e.message).toBe(getIncorrectMethodValueError('service/hello'));
      }
    }
  );

  test(`
  Scenario: createProxy without providing a router
  Given     a microservice container without setting defaultRouter
  When      calling createProxy without providing a router
  Then      exception will occur
  `, (done) => {
    expect.assertions(1);

    const msNoRouter = createMSNoRouter({});
    const proxy = msNoRouter.createProxy({ serviceDefinition: greetingServiceDefinition });
    proxy.hello().catch((err: Error) => {
      expect(err.message).toMatch(ROUTER_NOT_PROVIDED);
      done();
    });
  });

  test(`
  Scenario: createProxy without providing a router (dependency hook)
  Given     a microservice container without setting defaultRouter
  When      calling createProxy  from dependencyHook without providing a router
  Then      exception will occur
  `, (done) => {
    expect.assertions(1);

    createMSNoRouter({
      services: [
        {
          reference: ({ createProxy }) => {
            const proxy = createProxy({ serviceDefinition: greetingServiceDefinition });

            proxy.hello().catch((err: Error) => {
              expect(err.message).toMatch(ROUTER_NOT_PROVIDED);
              done();
            });

            return new GreetingService();
          },
          definition: greetingServiceDefinition,
        },
      ],
    });
  });
});
