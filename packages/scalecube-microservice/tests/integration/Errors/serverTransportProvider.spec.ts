// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { hello, greet$, greetingServiceDefinition } from '../../mocks/GreetingService';
import { Microservices } from '../../../src';
import { applyPostMessagePolyfill } from '../../mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../../mocks/utils/MessageChannelPolyfill';
import { MicroserviceContext } from '../../../src/helpers/types';
import { Observable } from 'rxjs';

const errorMessage = 'mockError';

/**
 *  Mock function for TransportProviders - MicroserviceServer.
 *  Make sure that the server will return error message
 */
jest.mock('../../../src/TransportProviders/MicroserviceServer', () => {
  return {
    createServer: ({ address, microserviceContext }: { address: string; microserviceContext: MicroserviceContext }) => {
      return new RSocketServer({
        getRequestHandler: (socket: any) => {
          return {
            requestResponse: () => Single.error(new Error(errorMessage)),
            requestStream: () => Flowable.error(new Error(errorMessage)),
          };
        },
        transport: new RSocketEventsServer({ address }),
      });
    },
  };
});

describe(` Test RSocket doesn't hide Flowable/Single errors`, () => {
  // @ts-ignore
  if (!global.isNodeEvn) {
    applyPostMessagePolyfill();
    applyMessageChannelPolyfill();
  } else {
    test('fake test for jest in node env', () => {
      return; // TODO: RFC - remoteCall nodejs
    });
    return; // TODO: RFC - remoteCall nodejs
  }

  const remoteMicroservice = Microservices.create({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: { hello, greet$ },
      },
    ],
  });
  const localMicroservice = Microservices.create({});
  const { awaitProxy } = localMicroservice.createProxies({
    proxies: [
      {
        serviceDefinition: greetingServiceDefinition,
        proxyName: 'awaitProxy',
      },
    ],
    isAsync: true,
  });

  test(`
    Scenario RSocketEventsServer send Single.error for requestResponse request
    Given    RSocketEventsServer
      And    RSocketEventsClient
    When     RSocketEventsClient send requestResponse
    And      RSocketEventsServer return Single.error
    Then     RSocketEventsClient receive the error message
    And      bubble it to the proxy
  `, async () => {
    expect.assertions(1);
    const { proxy } = await awaitProxy;
    return expect(proxy.hello('Me')).rejects.toMatchObject(new Error(errorMessage));
  });

  test(`
    Scenario RSocketEventsServer send Flowable.error for requestStream request
    Given    RSocketEventsServer
      And    RSocketEventsClient
    When     RSocketEventsClient send requestStream
    And      RSocketEventsServer return Flowable.error
    Then     RSocketEventsClient receive the error message
    And      bubble it to the proxy
  `, (done) => {
    expect.assertions(1);
    awaitProxy.then(({ proxy }: { proxy: { greet$: (...data: any[]) => Observable<any> } }) => {
      proxy.greet$(['Me']).subscribe(
        (res: any) => {},
        (error: any) => {
          expect(error).toMatchObject(new Error(errorMessage));
          done();
        }
      );
    });
  });
});
