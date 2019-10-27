/* tslint:disable:no-console */
import { createMicroservice } from '../../../src';
import { Observable } from 'rxjs';
import { greetingServiceDefinition } from '../../mocks/GreetingService';

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

  const { awaitProxyServiceC, awaitProxyServiceB } = createMicroservice({
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
  }).createProxies({
    proxies: [
      {
        proxyName: 'awaitProxyServiceC',
        serviceDefinition: greetingServiceDefinitionC,
      },
      {
        proxyName: 'awaitProxyServiceB',
        serviceDefinition: greetingServiceDefinitionB,
      },
    ],
    isAsync: true,
  });

  createMicroservice({
    services: [
      {
        reference: ({ createProxy }) => {
          const proxyA = createProxy({ serviceDefinition: greetingServiceDefinition });
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

  createMicroservice({
    services: [
      {
        reference: ({ createProxy }) => {
          const proxyB = createProxy({ serviceDefinition: greetingServiceDefinitionB });
          return {
            hello: () => {
              // console.log('serviceC');
              return proxyB.hello();
            },
            greet$: proxyB.greet$,
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
      const { proxy: proxyB } = await awaitProxyServiceB;
      const { proxy: proxyC } = await awaitProxyServiceC;

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
      const { proxy: proxyB } = await awaitProxyServiceB;
      const { proxy: proxyC } = await awaitProxyServiceC;

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
