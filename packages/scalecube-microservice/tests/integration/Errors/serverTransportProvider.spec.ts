import { TransportApi } from '@scalecube/api';
// @ts-ignore
import RSocketServer from 'rsocket-core/build/RSocketServer';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { hello, greet$, greetingServiceDefinition } from '../../mocks/GreetingService';
import { createMS } from '../../mocks/microserviceFactory';
import { ServiceCall } from '../../../src/helpers/types';
import { getAddress } from '@scalecube/utils';

const errorMessage = 'mockError';

/**
 *  Mock function for TransportProviders - MicroserviceServer.
 *  Make sure that the server will return error message
 */
jest.mock('../../../src/TransportProviders/MicroserviceServer', () => {
  return {
    startServer: ({
      address,
      serviceCall,
      transportServerProvider,
    }: {
      address: TransportApi.Address;
      serviceCall: ServiceCall;
      transportServerProvider: TransportApi.Provider;
    }) => {
      const { factoryOptions, providerFactory, serializers } = transportServerProvider;
      const server = new RSocketServer({
        getRequestHandler: (socket: any) => {
          return {
            requestResponse: () =>
              Single.error({
                message: {
                  data: errorMessage,
                  metadata: {
                    isErrorFormat: true,
                  },
                },
              }),
            requestStream: () =>
              Flowable.error({
                message: {
                  data: errorMessage,
                  metadata: {
                    isErrorFormat: true,
                  },
                },
              }),
          };
        },
        serializers: serializers || undefined,
        transport: providerFactory({ address, factoryOptions }),
      });

      server.start();
    },
  };
});

describe(` Test RSocket doesn't hide Flowable/Single errors`, () => {
  createMS({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: { hello, greet$ },
      },
    ],

    address: 'seed',
  });
  const localMicroservice = createMS({
    seedAddress: 'seed',
    address: getAddress('address'),
  });
  const proxy = localMicroservice.createProxy({ serviceDefinition: greetingServiceDefinition });

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
    proxy.greet$(['Me']).subscribe(
      (res: any) => {},
      (error: any) => {
        expect(error).toMatchObject(new Error(errorMessage));
        done();
      }
    );
  });
});
