import {
  GreetingService,
  GreetingServiceWithStatic,
  greetingServiceDefinition,
  hello,
  greet$,
} from '../mocks/GreetingService';
import { createMicroservice } from '../../src';
import { Message } from '@scalecube/api';
import { getAddress } from '@scalecube/utils';

describe(`Test positive-scenarios of usage
          LocalCall - a microservice instance use its own services.
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
		`,
    (service) => {
      const serviceDefinition = service.definition;
      const microserviceWithServices = createMicroservice({
        services: [service],
        address: getAddress('B'),
      });

      test(`
          Scenario: Testing proxy[createProxy] for a successful response.
            When  invoking requestResponse's method with valid data
            Then  successful RequestResponse is received
              `, () => {
        const proxy = microserviceWithServices.createProxy({ serviceDefinition });
        return expect(proxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
          Scenario: Testing proxy[createProxy] for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
            `, (done) => {
        const proxy = microserviceWithServices.createProxy({ serviceDefinition });
        proxy.greet$([defaultUser]).subscribe((response: any) => {
          expect(response).toEqual(`greetings ${defaultUser}`);
          done();
        });
      });

      test(`
          Scenario: Testing proxy[createProxies] for a successful response.
            When  invoking requestResponse's method with valid data
            Then  successful RequestResponse is received
              `, async () => {
        const { awaitProxy } = microserviceWithServices.createProxies({
          proxies: [
            {
              serviceDefinition,
              proxyName: 'awaitProxy',
            },
          ],
          isAsync: true,
        });
        const { proxy } = await awaitProxy;
        return expect(proxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
          Scenario: Testing proxy[createProxies] for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
            `, (done) => {
        const { awaitProxy } = microserviceWithServices.createProxies({
          proxies: [
            {
              serviceDefinition,
              proxyName: 'awaitProxy',
            },
          ],
          isAsync: true,
        });
        awaitProxy.then(({ proxy }: { proxy: GreetingService }) => {
          proxy.greet$([defaultUser]).subscribe((response: any) => {
            expect(response).toEqual(`greetings ${defaultUser}`);
            done();
          });
        });
      });

      test(`
          Scenario: Testing serviceCall for a successful response.
            When  invoking serviceCall's requestResponse method with valid message
            Then  successful RequestResponse is received
            `, () => {
        const message: Message = {
          qualifier: `${serviceDefinition.serviceName}/hello`,
          data: [`${defaultUser}`],
        };
        const serviceCall = microserviceWithServices.createServiceCall({});
        return expect(serviceCall.requestResponse(message)).resolves.toEqual(`Hello ${defaultUser}`);
      });

      test(`
          Scenario: Testing serviceCall for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
                  `, (done) => {
        const message: Message = {
          qualifier: `${serviceDefinition.serviceName}/greet$`,
          data: [[`${defaultUser}`]],
        };
        const serviceCall = microserviceWithServices.createServiceCall({});

        serviceCall.requestStream(message).subscribe((response: any) => {
          expect(response).toEqual(`greetings ${defaultUser}`);
          done();
        });
      });
    }
  );
});
