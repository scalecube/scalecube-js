/* tslint:disable:no-console */
import { createMS } from '../../mocks/microserviceFactory';
import { Observable } from 'rxjs';
import { greetingServiceDefinition } from '../../mocks/GreetingService';
import { retryRouter } from '@scalecube/routers';

describe(`
Given 3 microservice containers A,B,C
|ms  | parent     | children    | method   |
|A   | -          | B           |  activeA |   
|B   | A          | C           |  activeB |
|C   | B          | B           |  activeC |


When activeC calls activeB 
And activeB calls activeA
And activeA method reject and  throw exception
Then activeC should catch the exception

activeC => remoteCall => activeB => remoteCall => activeA => reject => activeB => reject => activeC

`, () => {
  // @ts-ignore
  if (global.isNodeEvn) {
    return; // TODO: RFC - remoteCall nodejs
  }

  let error = 'test error';
  const greetingServiceDefinitionB = { ...greetingServiceDefinition, serviceName: 'GreetingServiceB' };
  const greetingServiceDefinitionC = { ...greetingServiceDefinition, serviceName: 'GreetingServiceC' };

  const ms = createMS({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: {
          // @ts-ignore
          hello: () => Promise.reject(error),
          greet$: () =>
            new Observable((obs) => {
              obs.error(error);
            }),
        },
      },
    ],
    address: 'A',
    debug: false,
  });

  const proxyC = ms.createProxy({ serviceDefinition: greetingServiceDefinitionC });

  createMS({
    services: [
      {
        reference: ({ createProxy }) => {
          const proxyA = createProxy({
            serviceDefinition: greetingServiceDefinition,
            router: retryRouter({ period: 10 }),
          });
          return {
            hello: () => {
              // console.log('serviceB');
              return proxyA.hello();
            },
            greet$: proxyA.greet$,
          };
        },
        definition: greetingServiceDefinitionB,
      },
    ],
    seedAddress: 'A',
    address: 'B',
    debug: false,
  });

  createMS({
    services: [
      {
        reference: ({ createProxy }) => {
          const proxy = createProxy({ serviceDefinition: greetingServiceDefinitionB });
          return {
            hello: () => {
              // console.log('serviceC');
              return proxy.hello();
            },
            greet$: proxy.greet$,
          };
        },
        definition: greetingServiceDefinitionC,
      },
    ],
    seedAddress: 'B',
    address: 'C',
    debug: false,
  });

  test.each(['reject with string', { data: 'reject as object' }, new Error('reject with new Error')])(
    'requesrResponse error',
    // @ts-ignore
    async (e, done) => {
      error = e;

      proxyC.hello('').catch((err: any) => {
        // console.log('err', err);
        expect(err).toEqual(e);
        done();
      });
    }
  );

  test.each(['reject with string', { data: 'reject as object' }, new Error('reject with new Error')])(
    'requestStream error',
    // @ts-ignore
    async (e, done) => {
      error = e;

      const subscriber = proxyC.greet$('').subscribe({
        error: (err: any) => {
          // console.log('err', err);
          expect(err).toEqual(e);
          subscriber.unsubscribe();
          done();
        },
      });
    }
  );
});
