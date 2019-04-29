import GreetingService, {
  GreetingServiceWithStatic,
  greetingServiceDefinition,
  hello,
  greet$,
} from '../mocks/GreetingService';
import { Microservices } from '../../src';
import { Message } from '../../src/api';

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
        And    serviceDefinition that define the contract of the service
        And    creating proxy and serviceCall
		`,
    (service) => {
      const microservice = Microservices.create({
        services: [service],
      });

      /*test.each([
          {
            eachMethod: proxy.hello,
            eachData: [defaultUser],
          },
          {
            eachMethod: serviceCall.requestResponse,
            eachData: {
              qualifier: `${greetingServiceDefinition.serviceName}/hello`,
              data: [defaultUser],
            },
          },
        ])*/
      test(`
        # Testing proxy for a successful response.
        When  invoking requestResponse's method with valid data
        Then  successful RequestResponse is received
        			`, () => {
        const proxy = microservice.createProxy({ serviceDefinition: greetingServiceDefinition });
        return expect(proxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
        # Testing serviceCall for a successful response.
        When  invoking serviceCall's requestResponse method with valid message
        Then  successful RequestResponse is received
        `, () => {
        const message: Message = {
          qualifier: `${greetingServiceDefinition.serviceName}/hello`,
          data: [`${defaultUser}`],
        };
        const serviceCall = microservice.createServiceCall({});
        return expect(serviceCall.requestResponse(message)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
        # Testing serviceCall for a successful subscription (array).
        When  subscribe to RequestStream's method with valid data/message
        Then  successful RequestStream is emitted
        			`, (done) => {
        const message: Message = {
          qualifier: `${greetingServiceDefinition.serviceName}/greet$`,
          data: [[`${defaultUser}`]],
        };
        const serviceCall = microservice.createServiceCall({});

        serviceCall.requestStream(message).subscribe((response: any) => {
          expect(response).toEqual(`greetings ${defaultUser}`);
          done();
        });
      });
      test(`
        # Testing serviceCall for a successful subscription (array).
        When  subscribe to RequestStream's method with valid data/message
        Then  successful RequestStream is emitted
        `, (done) => {
        const proxy = microservice.createProxy({ serviceDefinition: greetingServiceDefinition });
        proxy.greet$([defaultUser]).subscribe((response: any) => {
          expect(response).toEqual(`greetings ${defaultUser}`);
          done();
        });
      });
    }
  );
});
