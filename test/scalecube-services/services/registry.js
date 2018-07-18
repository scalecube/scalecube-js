// @flow
describe('Registry suite', () => {
  it('When two registry', () => {
    it('Greeting.hello should greet Idan with hello', () => {

      let x = GreetingService;
      const greetingService = Microservices
        .builder()
        .services(new GreetingService(), new GreetingService())
        .build()
        .proxy()
        .api(GreetingService)
        .create();

      expect.assertions(1);
      return expect(greetingService.hello('Idan')).resolves.toEqual("Hello Idan");
    });
  });
});
