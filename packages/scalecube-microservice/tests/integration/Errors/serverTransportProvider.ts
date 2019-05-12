// @ts-ignore
import RSocketEventsServer from 'rsocket-events-server';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { catchError } from 'rxjs/operators';
import { hello, greet$, greetingServiceDefinition } from '../../mocks/GreetingService';
import { Microservices } from '../../../src';
import { applyPostMessagePolyfill } from '../../mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../../mocks/utils/MessageChannelPolyfill';
import { MicroserviceContext } from '../../../src/helpers/types';

const errorMessage = 'mockError';

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
  const proxy = localMicroservice.createProxy({ serviceDefinition: greetingServiceDefinition });

  test(`
    Scenario RSocketEventsServer send Single.error for requestResponse request
    Given    RSocketEventsServer
      And    RSocketEventsClient
    When     RSocketEventsClient send requestResponse
    And      RSocketEventsServer return Single.error
    Then     RSocketEventsClient receive the error message
    And      bubble it to the proxy
  `, () => {
    expect.assertions(1);

    return expect(proxy.hello('Me')).rejects.toMatchObject({
      source: {
        message: errorMessage,
      },
    });
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

    proxy
      .greet$(['Me'])
      .pipe(
        catchError((error: any) => {
          expect(error).toMatchObject({
            source: {
              message: errorMessage,
            },
          });
          done();
          return [];
        })
      )
      .subscribe();
  });
});