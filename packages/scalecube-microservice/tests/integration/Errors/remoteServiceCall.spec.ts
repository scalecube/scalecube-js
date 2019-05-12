import { ASYNC_MODEL_TYPES, Microservices } from '../../../src';
import { applyPostMessagePolyfill } from '../../mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../../mocks/utils/MessageChannelPolyfill';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

const errorMessage = 'mockError';
const emptyMessage = 'mockEmpty';

describe(`Test RSocket doesn't hide remoteService errors`, () => {
  // @ts-ignore
  if (!global.isNodeEvn) {
    applyPostMessagePolyfill();
    applyMessageChannelPolyfill();
  }

  const greetingServiceDefinition = {
    serviceName: 'GreetingService',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
      greet$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
      incorrectAsyncModel: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
      incorrectAsyncModel$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
    },
  };
  const microserviceWithServices = Microservices.create({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: {
          hello: () => Promise.reject(new Error(errorMessage)),
          greet$: () =>
            new Observable((obs) => {
              obs.error(new Error(errorMessage));
            }),
          incorrectAsyncModel: () => of({ emptyMessage }),
          incorrectAsyncModel$: () => Promise.resolve({ emptyMessage }),
        },
      },
    ],
  });

  const microServiceWithoutServices = Microservices.create({});

  describe.each([
    // ################# LocalCall #################
    {
      sender: microserviceWithServices,
      receiverServiceDefinition: greetingServiceDefinition,
      isRemote: false,
    },
    // ################# RemoteCall ################
    {
      sender: microServiceWithoutServices,
      receiverServiceDefinition: greetingServiceDefinition,
      isRemote: true,
    },
  ])(
    `
        Given  'sender' and a 'receiverServiceDefinition' (receiver)
               sender (microservice)       | receiverServiceDefinition (receiver)    |
               microserviceWithServices    | greetingServiceDefinition               | # LocalCall
               microserviceWithoutServices | greetingServiceDefinition               | # RemoteCallCall

        `,
    (connect) => {
      const { sender, receiverServiceDefinition, isRemote } = connect;

      // @ts-ignore
      if (isRemote && global.isNodeEvn) {
        return; // TODO: RFC - remoteCall nodejs
      }

      test(`
    Scenario: service reject
    Given     proxy and remoteService
    When      remoteService reject
    Then      proxy receive the error message

  `, () => {
        expect.assertions(1);
        const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });

        return expect(proxy.hello('Me')).rejects.toMatchObject(new Error(errorMessage));
      });

      test(`
    Scenario: service emit error
    Given     proxy and remoteService
    When      remoteService emit error
    Then      proxy receive the error message
  `, (done) => {
        expect.assertions(1);

        const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });
        proxy
          .greet$(['Me'])
          .pipe(
            catchError((error: any) => {
              expect(error).toMatchObject(new Error(errorMessage));
              done();
              return [];
            })
          )
          .subscribe();
      });

      test(`
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `, () => {
        expect.assertions(1);
        const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });
        return expect(proxy.incorrectAsyncModel('Me')).resolves.toMatchObject({ emptyMessage });
      });

      test(`
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `, (done) => {
        expect.assertions(1);
        const proxy = sender.createProxy({ serviceDefinition: receiverServiceDefinition });
        proxy.incorrectAsyncModel$().subscribe((res: any) => {
          expect(res).toMatchObject({ emptyMessage });
          done();
        });
      });
    }
  );
});