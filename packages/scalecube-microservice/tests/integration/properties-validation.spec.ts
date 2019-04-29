/**
 * Properties of methods are listed here with their validity tests.
 */

describe('Validation tests for services', () => {
  test.each([serviceName])(
    `
      Scenario: Validating services received values
        Given   serviceDefinition 
				When		creating a microService with 'serviceName'
        				|serviceName			|
        				|256  		   			|
        				|null       			|
        				|object						|
        				|array       			|
        				|undefind					|
        				|0         				|
        				|-1        				|
				Then		exception will occur with service, greetingService is not valid
    `,
    () => {
      expect(true).toBe(false);
    }
  );
});

describe('Validation tests for methods', () => {
  test.each([methodName])(
    `
    	Scenario: Validating methods received values
        Given   microService
				When		creating a serviceCall
				And			serviceCall created with 'serviceName'
        				|serviceName			|
        				|256  		   			|
        				|null       			|
        				|object						|
        				|array       			|
        				|undefind					|
        				|0         				|
        				|-1        				|
				Then		exception will occur with serviceCall
      `,
    () => {}
  );
});
