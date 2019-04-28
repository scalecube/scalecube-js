import GreetingService, {
  GreetingServiceWithStatic,
  greetingServiceDefinition,
  hello,
  greet$,
} from '../mocks/GreetingService';
import { Microservices } from '../../src';

describe(`Test LocalCall - a microservice instance use its own services.
          # 1. creating a microservice with service & serviceDefinition.
          # 2. creating a proxy || serviceCall from the microservice instance.
          # 3. invoke || subscribe to a method successfully.
          # 4. receive response
`, () => {
  const defaultUser = 'defaultUser';
  const GreetingServiceObject = { hello, greet$ };

  describe.each([
    {
      definition: greetingServiceDefinition,
      reference: new GreetingService(),
    },
    {
      definition: greetingServiceDefinition,
      reference: new GreetingServiceWithStatic(),
    },
    {
      definition: greetingServiceDefinition,
      reference: GreetingServiceObject,
    },
  ])(
    `Background
	      Given  a service as
	             | class       | # class without static methods
               | static class| # class not object with static methods
               | Plan Object | # Object format is [key]: function
        And  serviceDefinition that define the contract of the service
        And  creating proxy and serviceCall
		`,
    (service) => {
      const microservice = Microservices.create({
        services: [service],
      });
      const proxy = microservice.createProxy({ serviceDefinition: greetingServiceDefinition }); //
      const serviceCall = microservice.createServiceCall({});

      test.each([
        [proxy.hello, defaultUser],
        [
          serviceCall.requestResponse,
          {
            qualifier: `${greetingServiceDefinition.serviceName}/hello`,
            data: [defaultUser],
          },
        ],
      ])(
        `
        When invoking requestResponse's method with valid data/message
        Then successful RequestResponse is receive
        			`,
        (invokeMethod, invokeData) => {
          return expect(invokeMethod(invokeData)).resolves.toEqual(`Hello ${defaultUser}`);
        }
      );

      test.each([
        [proxy.greet$, [`${defaultUser}`]],
        [
          serviceCall.requestStream,
          {
            qualifier: `${greetingServiceDefinition.serviceName}/greet$`,
            data: [[`${defaultUser}`]],
          },
        ],
      ])(
        `
        When subscribe to RequestStream's method with valid data/message
        Then successful RequestStream is emitted
        			`,
        (invokeMethod, invokeData, done) => {
          invokeMethod(invokeData).subscribe((response: string) => {
            expect(response).toEqual(`greetings ${defaultUser}`);
            done();
          });
        }
      );
    }
  );
});
