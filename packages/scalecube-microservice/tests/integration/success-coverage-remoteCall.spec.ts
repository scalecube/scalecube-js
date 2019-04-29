import GreetingService, {
  GreetingServiceWithStatic,
  greetingServiceDefinition,
  hello,
  greet$,
} from '../mocks/GreetingService';
import { Microservices } from '../../src';

describe(`Test RemoteCall - a microservice instance use other microservice's services.
          # 1. creating a microservice (remote) with service & serviceDefinition and with seedAddress='defaultSeedAddress'.
          # 2. creating a microservice (local) without services but with seedAddress='defaultSeedAddress'.
          # 3. discoveries discover other microservices under the same seed.
          # 4. creating a proxy || serviceCall from the local microservice instance.
          # 5. invoke || subscribe to a method successfully.
          # 6. receive response
`, () => {
  const defaultUser = 'defaultUser';
  const seedAddress = 'defaultSeedAddress';
  const GreetingServiceObject = { hello, greet$ };

  const localMicroservice = Microservices.create({ seedAddress });

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
      Microservices.create({
        services: [service],
        seedAddress,
      });
      const proxy = localMicroservice.createProxy({ serviceDefinition: greetingServiceDefinition }); //
      const serviceCall = localMicroservice.createServiceCall({});

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
          // return expect(invokeMethod(invokeData)).resolves.toEqual(`Hello ${defaultUser}`); // not implemented
          return expect(invokeMethod(invokeData)).resolves.toEqual({});
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
            // expect(response).toEqual(`greetings ${defaultUser}`); // not implemented
            expect(response).toEqual({});
            done();
          });
        }
      );
    }
  );
});
