import { TransportApi } from '@scalecube/api';
// @ts-ignore
import { RSocketServer } from 'rsocket-core';
// @ts-ignore
import { Flowable, Single } from 'rsocket-flowable';
import { hello, greet$, greetingServiceDefinition } from '../../mocks/GreetingService';
import { Microservices } from '../../../src';
import { ServiceCall } from '../../../src/helpers/types';
import { Observable } from 'rxjs';
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
      transportServerProvider: TransportApi.ServerProvider;
    }) => {
      const { factoryOptions, serverFactory } = transportServerProvider;
      const server = new RSocketServer({
        getRequestHandler: (socket: any) => {
          return {
            requestResponse: () => Single.error(new Error(errorMessage)),
            requestStream: () => Flowable.error(new Error(errorMessage)),
          };
        },
        transport: serverFactory({ address, factoryOptions }),
      });

      server.start();
    },
  };
});

describe(` Test RSocket doesn't hide Flowable/Single errors`, () => {
  Microservices.create({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: { hello, greet$ },
      },
    ],

    address: 'seed',
  });
  const localMicroservice = Microservices.create({
    seedAddress: 'seed',
    address: getAddress('address'),
  });
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
