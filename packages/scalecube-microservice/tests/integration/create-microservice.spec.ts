describe('fail creating microservices', () => {
  test(`
      Scenario: Fail to register a service, asyncModel invalid
        Given   a service with definition and reference
        And     definition and reference comply with each other
        |service          |definition            |reference             |
        |greetingService  |hello: null           |                      |
        # reference has a method that is not a function
        When    creating a Microservice with the service
        Then    a Microservice will not be created
        And     exception will occur with service greetingService is not valid.
      
      Scenario: Fail to register a service, (silent failing)
        Given   a service with definition and reference
        |service          |definition            |reference             |
        |greetingService  |                      |hello: RequestResponse|
        # reference has a method that is not contained in the definition
        When    creating a Microservice with the service
        Then    Microservice will successfully created
        But Microservice instance won't contain hello method
      `, () => {
    expect(true).toBe(false);
  });
});
