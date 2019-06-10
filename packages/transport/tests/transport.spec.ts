import { Transport } from '../src';
import { NOT_VALID_PROTOCOL } from '../src/helpers/constants';
/* tslint:disable */

const mockServer = jest.fn();
jest.mock('rsocket-events-server', () => {
  return class RSocketEventsServer {
    constructor(data: any) {
      mockServer(data);
    }
  };
});

const mockClient = jest.fn();
jest.mock('rsocket-events-client', () => {
  return class RSocketEventsClient {
    constructor(...data: any) {
      mockClient(data);
    }
  };
});

jest.mock('rsocket-websocket-server', () => {
  return class RSocketEventsServer {
    constructor(data: any) {
      mockServer(data);
    }
  };
});

jest.mock('rsocket-websocket-client', () => {
  return class RSocketEventsClient {
    constructor(...data: any) {
      mockClient(data);
    }
  };
});

jest.mock('rsocket-tcp-server', () => {
  return class RSocketEventsServer {
    constructor(data: any) {
      mockServer(data);
    }
  };
});

jest.mock('rsocket-tcp-client', () => {
  return class RSocketEventsClient {
    constructor(...data: any) {
      mockClient(data);
    }
  };
});

beforeEach(() => {
  mockClient.mockClear();
  mockServer.mockClear();
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
      mock: mockServer,
      providerCallback: Transport.remoteTransportServerProvider.transportServerProviderCallback,
      options: {
        remoteTransportServerProviderOptions: null,
      },
    },
    {
      mock: mockClient,
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
      test.each(['pm', 'ws', 'tcp'])(
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

      test.each([10, [], {}, true, null, undefined, '', 'dfsdf'])(
        `
         Scenario: validation check - protocol
         Given     protocol
         
         | type               | value         |
         --------------------------------------
         | number             | 10            |
         | array              | []            |
         | object             | {}            |
         | boolean            | true          |
         | null               | null          |
         | undefined          | undefined     |  
         | empty string       | ''            |
         | not valid protocol | 'dfsdf'       |
         
         And       a transport provider callback
         When      invoking transport provider
         Then      error will be thrown
         `,
        (protocol) => {
          expect.assertions(1);
          address.protocol = protocol;
          address.fullAddress = `${protocol}://${address.host}:${address.port}/${address.path}`;

          try {
            Transport.remoteTransportServerProvider.transportServerProviderCallback({
              remoteTransportServerProviderOptions: null,
              address,
            });
          } catch (e) {
            expect(e.message).toMatch(NOT_VALID_PROTOCOL);
          }
        }
      );
    }
  );
});
