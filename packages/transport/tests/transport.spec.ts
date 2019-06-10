import { Transport } from '../src';
/* tslint:disable */

const mockServerPM = jest.fn();
jest.mock('rsocket-events-server', () => {
  return class RSocketEventsServer {
    constructor(data: any) {
      mockServerPM(data);
    }
  };
});

const mockClientPM = jest.fn();
jest.mock('rsocket-events-client', () => {
  return class RSocketEventsClient {
    constructor(...data: any) {
      mockClientPM(data);
    }
  };
});

describe(`
         Background: rsocket provider is selected base on protocol
         Given       TransportServerProviderCallback
         And         TransportClientProviderCallback
         And         address with path, host, port
         
         
`, () => {
  const address = {
    path: 'path',
    host: 'host',
    port: 8080,
    protocol: '',
    fullAddress: '',
  };

  describe.each([
    {
      mock: mockServerPM,
      providerCallback: Transport.remoteTransportServerProvider.transportServerProviderCallback,
      options: {
        remoteTransportServerProviderOptions: null,
      },
    },
    {
      mock: mockClientPM,
      providerCallback: Transport.remoteTransportClientProvider.transportClientProviderCallback,
      options: {
        remoteTransportClientProviderOptions: null,
      },
    },
  ])(
    `
  Given RSocket provider:
  # RSocketServerProvider - server
  # RSocketClientProvider - client
  
  `,
    ({ mock, providerCallback, options }) => {
      test.each(['pm' /*, 'ws', 'http', 'https'*/])(
        `
  Scenario: create RSocketServerProvider | RSocketClientProvider
  Given     protocol
  And       partial configured address
  And       rsocket transport provider
  When      invoking transport provider
  Then      the provider will be determine by the protocol
`,
        (protocol) => {
          expect.assertions(1);

          address.protocol = protocol;
          address.fullAddress = `${protocol}://${address.host}:${address.port}/${address.path}`;

          providerCallback({
            ...options,
            address,
          });

          expect(mock).toHaveBeenCalledTimes(1);
        }
      );
    }
  );
});
