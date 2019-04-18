/**
 * Provision is the process that we creating microservice
 * On this process we create/bootstrap "service" or "services"
 * After we did this part we can create our "microservice" instance
 * We need to provide in creation process reference and definition of the to service methods
 */

describe('Provisioning test suite', () => {
  test.each([HelloServiceStatic, helloServiceInstance, HelloServicePlanObject])(
    `
      Scenario: Provisioning a service (creating microservice) success case
        Given   HelloService implemented as:
          | static class| # class not object with static methods
          | Instance    | # Instance of a class
          | Plan Object | # Object format is [key]: function
          # Modules
          # you can also use modules
          # In the end those are plan object 
          # but you must be sure it's normalized like in the plan object case
          # for example if you are using ESM and doing export foo; export boo; 
          # Usually it will be under "default" (mod.default.foo .boo) you should pass mod.default not "mod"
        And     HelloService have method hello: Promise<"world">
        And     Service reference is: 
          | serviceName  | Methods                     |
          | HelloService | { hello: REQUEST_RESPONSE } |
        When    creating a Microservice with HelloService
        Then    microservice will be created successfully
        And     microservice will be with HelloService.hello service
        # We will assert HelloService.hello was provision by invoke the service method
        # We don't need to specify it because it's part of another test case 
      `,
    () => {}
  );
});
