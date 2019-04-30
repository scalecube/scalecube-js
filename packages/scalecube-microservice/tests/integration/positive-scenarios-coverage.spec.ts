import {
  GreetingService,
  GreetingServiceWithStatic,
  greetingServiceDefinition,
  hello,
  greet$,
} from '../mocks/GreetingService';
import { Microservices } from '../../src';
import { Message } from '../../src/api';
import { applyMessageChannelPolyfill } from '../mocks/utils/MessageChannelPolyfill';
import { applyPostMessagePolyfill } from '../mocks/utils/PostMessageWithTransferPolyfill';

describe(`Test positive-scenarios of usage
          LocalCall - a microservice instance use its own services.
          # 1. creating a microservice with service & serviceDefinition.
          # 2. creating a proxy || serviceCall from the microservice instance.
          # 3. invoke || subscribe to a method successfully.
          # 4. receive response
          
          RemoteCall - a microservice instance use other microservice's services.
          # 1. creating a microservice (remote) with service & serviceDefinition and with seedAddress='defaultSeedAddress'.
          # 2. creating a microservice (local) without services but with seedAddress='defaultSeedAddress'.
          # 3. discoveries discover other microservices under the same seed.
          # 4. creating a proxy || serviceCall from the local microservice instance.
          # 5. invoke || subscribe to a method successfully.
          # 6. receive response
`, () => {
  applyPostMessagePolyfill();
  applyMessageChannelPolyfill();
  const defaultUser = 'defaultUser';
  const seedAddress = 'defaultSeedAddress';
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
      const microserviceWithServices = Microservices.create({
        services: [service],
        seedAddress,
      });

      const microserviceWithoutServices = Microservices.create({
        seedAddress,
      });

      describe.each([
        // ################# LocalCall #################
        {
          sender: microserviceWithServices,
          receiverServiceDefinition: greetingServiceDefinition,
        },
        // ################# RemoteCall ################
        {
          sender: microserviceWithoutServices,
          receiverServiceDefinition: greetingServiceDefinition,
        },
      ])(
        `
        Given  'sender' and a 'receiverServiceDefinition' (receiver)
               sender (microservice)       | receiverServiceDefinition (receiver)    |
               microserviceWithServices    | greetingServiceDefinition               | # LocalCall
               microserviceWithoutServices | greetingServiceDefinition               | # RemoteCallCall

        `,
        (connect) => {
          const { sender, receiverServiceDefinition } = connect;

          test(`
        # Testing proxy for a successful response.
        When  invoking requestResponse's method with valid data
        Then  successful RequestResponse is received
              `, () => {
            const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });
            return expect(proxy.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
          });

          test(`
            # Testing proxy for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
            `, (done) => {
            const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });
            proxy.greet$([defaultUser]).subscribe((response: any) => {
              expect(response).toEqual(`greetings ${defaultUser}`);
              done();
            });
          });

          test(`
            # Testing serviceCall for a successful response.
            When  invoking serviceCall's requestResponse method with valid message
            Then  successful RequestResponse is received
            `, () => {
            const message: Message = {
              qualifier: `${receiverServiceDefinition.serviceName}/hello`,
              data: [`${defaultUser}`],
            };
            const serviceCall = sender.createServiceCall({});
            return expect(serviceCall.requestResponse(message)).resolves.toEqual(`Hello ${defaultUser}`);
          });

          test(`
            # Testing serviceCall for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
                  `, (done) => {
            const message: Message = {
              qualifier: `${receiverServiceDefinition.serviceName}/greet$`,
              data: [[`${defaultUser}`]],
            };
            const serviceCall = sender.createServiceCall({});

            serviceCall.requestStream(message).subscribe((response: any) => {
              expect(response).toEqual(`greetings ${defaultUser}`);
              done();
            });
          });
        }
      );
    }
  );
});
