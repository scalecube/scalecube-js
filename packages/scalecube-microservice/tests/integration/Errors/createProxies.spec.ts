/*****
 * This file contains scenarios for failed attempts when using createProxy method.
 * 1. Included validation tests for createProxy.
 * 2. Related issue in GitHub
 *    Check validation - proxy - serviceDefinition without serviceName - https://github.com/scalecube/scalecube-js/issues/106
 *    Check validity - proxy - serviceDefinition method format         - https://github.com/scalecube/scalecube-js/issues/104
 *    Check validity - proxy - serviceDefinition asyncModel value      - https://github.com/scalecube/scalecube-js/issues/103
 *****/
import { Microservices } from '../../../src';
import {
  DEFINITION_MISSING_METHODS,
  INVALID_METHODS,
  SERVICE_NAME_NOT_PROVIDED,
  getIncorrectMethodValueError,
  getServiceNameInvalid,
  DUPLICATE_PROXY_NAME,
} from '../../../src/helpers/constants';
import { ProxiesOptions } from '../../../src/api';

describe('validation test for create proxy from microservice', () => {
  const ms = Microservices.create({});

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

    const { awaitProxy } = ms.createProxies({
      proxies: [
        {
          // @ts-ignore
          serviceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });
    return expect(awaitProxy).rejects.toMatchObject(new Error(SERVICE_NAME_NOT_PROVIDED));
  });
  // @ts-ignore
  test.each([[], {}, true, false, 10, null, Symbol()])(
    `
    Scenario: serviceDefinition with invalid 'serviceName' value
    Given     a 'serviceName'
      And     a microservice instance
    When      creating a serviceDefinition with the 'serviceName'
              | type       | 'serviceName' |
              | array	     | []            |
              | object	   | {}            |
              | boolean	   | true          |
              | boolean	   | false         |
              | number	   | 10            |
              | null	     | null          |
              | undefined	 | undefined     |
              | symbol	   | Symbol()      |
    And       creating a proxy from the microservice with the serviceDefinition
    Then      exception will occur.`,
    (serviceName) => {
      expect.assertions(1);

      const serviceDefinition = {
        serviceName,
      };

      const { awaitProxy } = ms.createProxies({
        proxies: [
          {
            // @ts-ignore
            serviceDefinition,
            proxyName: 'awaitProxy',
          },
        ],
        isAsync: true,
      });

      return expect(awaitProxy).rejects.toMatchObject(new Error(getServiceNameInvalid(serviceDefinition.serviceName)));
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

    const { awaitProxy } = ms.createProxies({
      proxies: [
        {
          // @ts-ignore
          serviceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });
    return expect(awaitProxy).rejects.toMatchObject(new Error(DEFINITION_MISSING_METHODS));
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

      const { awaitProxy } = ms.createProxies({
        proxies: [
          {
            // @ts-ignore
            serviceDefinition,
            proxyName: 'awaitProxy',
          },
        ],
        isAsync: true,
      });

      return expect(awaitProxy).rejects.toMatchObject(new Error(INVALID_METHODS));
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

      const { awaitProxy } = ms.createProxies({
        proxies: [
          {
            // @ts-ignore
            serviceDefinition,
            proxyName: 'awaitProxy',
          },
        ],
        isAsync: true,
      });

      return expect(awaitProxy).rejects.toMatchObject(new Error(getIncorrectMethodValueError('service/hello')));
    }
  );

  test(`
    Scenario: validation check for duplication of proxyName 
    Given     a microservice 
    And       2 ProxiesOptions have same proxyName
              |proxy	| proxyName	  | serviceDefinition
              |proxy1 |	'proxyName'	| greetingsServiceDefinition
              |proxy2 |	'proxyName'	| helloServiceDefinition
    When      createProxies with both ProxiesOptions
    Then      error will be thrown
    And       proxiesMap won't be created
`, () => {
    expect.assertions(1);

    const proxiesOptions1: ProxiesOptions = {
      proxyName: 'proxyName',
      serviceDefinition: { serviceName: 'valid1', methods: {} },
    };

    const proxiesOptions2: ProxiesOptions = {
      proxyName: 'proxyName',
      serviceDefinition: { serviceName: 'valid2', methods: {} },
    };

    try {
      ms.createProxies({
        proxies: [proxiesOptions1, proxiesOptions2],
        isAsync: true,
      });
    } catch (e) {
      expect(e.message).toMatch(DUPLICATE_PROXY_NAME);
    }
  });
});
