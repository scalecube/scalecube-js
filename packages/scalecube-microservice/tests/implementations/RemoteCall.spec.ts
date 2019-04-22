import { from } from 'rxjs';
import { Service } from '../../src/api';
import { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService from '../mocks/GreetingService';
import Microservices from '../../src';
import { map } from 'rxjs/operators';
import { getGlobalNamespace } from '../../src/helpers/utils';
import { ScalecubeGlobal } from '@scalecube/scalecube-discovery/lib/helpers/types';

const FAKE_REQUEST_RESPONSE = 'fake server requestResponse';
const FAKE_REQUEST_STREAM = 'fake server requestStream';
const RSOCKET_SERVER_MOCK = jest.fn();
const RSOCKET_CLIENT_MOCK = jest.fn();
const socket = {
  // @ts-ignore
  requestResponse: () => Promise.resolve({ data: JSON.stringify({ data: FAKE_REQUEST_RESPONSE }) }),
  requestStream: (message: any) => {
    const { data } = JSON.parse(message.data);
    // @ts-ignore
    return from(...data).pipe(map((val, key) => ({ data: JSON.stringify({ data: `${FAKE_REQUEST_STREAM}${key}` }) })));
  },
};

const defaultUser = 'defaultUser';

jest.mock('rsocket-core', () => ({
  // @ts-ignore
  RSocketClient: class RSocketClient {
    public connect() {
      RSOCKET_CLIENT_MOCK();
      // @ts-ignore
      return Promise.resolve(socket);
    }
  },
  // tslint:disable-next-line
  RSocketServer: class RSocketServer {
    public start() {
      return RSOCKET_SERVER_MOCK();
    }
  },
}));

beforeEach(() => {
  getGlobalNamespace().scalecube = {} as ScalecubeGlobal;

  RSOCKET_CLIENT_MOCK.mockClear();
  RSOCKET_SERVER_MOCK.mockClear();
});

describe(`Background: multiple microservices under the same seedAddress sharing services. `, () => {
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  test(`Scenario: RSocket server will be created for each microservice in the creation phase
        Given    creating two microservices [m1, m2]
        | microservice | services               |
        | m1           |                        |
        | m2           | hello: requestResponse |
        | m2           | greet$: requestStream  |
        Then each microservice should start its own RSocketServer.
  `, () => {
    expect.assertions(1);

    Microservices.create({ services: [] });
    Microservices.create({ services: [greetingService1] });
    return expect(RSOCKET_SERVER_MOCK.mock.calls).toHaveLength(2);
  });

  test.each([1, 3, 9])(
    `Scenario: RSocket client will be created only per method invoke
        Given     two microservices [m1, m2]
        | microservice | services               |
        | m1           |                        |
        | m2           | hello: requestResponse |
        | m2           | greet$: requestStream  |
        And proxy is created from m1 ==> ms1Proxy
        When invoking ms1Proxy.hello (requestResponse)
        Then connection will be made.
  `,
    (NUMBER_OF_INVOKES) => {
      expect.assertions(1);

      const ms1 = Microservices.create({ services: [] });
      const ms2 = Microservices.create({ services: [greetingService1] });
      const ms1Proxy = ms1.createProxy({ serviceDefinition: greetingServiceDefinition });
      for (let i = 0; i < NUMBER_OF_INVOKES; i++) {
        ms1Proxy.hello(defaultUser);
      }

      return expect(RSOCKET_CLIENT_MOCK.mock.calls).toHaveLength(NUMBER_OF_INVOKES);
    }
  );

  test.each([[1, 0], [3, 1], [9, 5]])(
    `Scenario: RSocket client will be created only per method subscribe (lazy)
        Given     two microservices [m1, m2]
        | microservice | services               |
        | m1           |                        |
        | m2           | hello: requestResponse |
        | m2           | greet$: requestStream  |
        And proxy is created from m1 ==> ms1Proxy
        When invoking ms1Proxy.greet$ (requestStream)
        Then connection will be made only for the subscribed methods.
  `,
    (NUMBER_OF_INVOKES, ITERATOR_TO_SUBSCRIBE) => {
      expect.assertions(1);

      const ms1 = Microservices.create({ services: [] });
      const ms2 = Microservices.create({ services: [greetingService1] });
      const ms1Proxy = ms1.createProxy({ serviceDefinition: greetingServiceDefinition });
      for (let i = 0; i < NUMBER_OF_INVOKES; i++) {
        const greetMethod = ms1Proxy.greet$([defaultUser]);

        if (ITERATOR_TO_SUBSCRIBE === i) {
          greetMethod.subscribe();
        }
      }

      return expect(RSOCKET_CLIENT_MOCK.mock.calls).toHaveLength(1);
    }
  );

  test(`Scenario: remoteCall will return the data in the correct asyncModel 
        Given     two microservices [m1, m2]
        | microservice | services               |
        | m1           |                        |
        | m2           | hello: requestResponse |
        | m2           | greet$: requestStream  |
        And proxy is created from m1 ==> ms1Proxy
        When invoking ms1Proxy.hello (requestStream)
        Then the data will return as Promise
  `, () => {
    expect.assertions(1);
    const ms1 = Microservices.create({ services: [] });
    const ms2 = Microservices.create({ services: [greetingService1] });
    const ms1Proxy = ms1.createProxy({ serviceDefinition: greetingServiceDefinition });
    return expect(ms1Proxy.hello(defaultUser)).resolves.toEqual(FAKE_REQUEST_RESPONSE);
  });

  test(`Scenario: remoteCall will return the data in the correct asyncModel 
        Given     two microservices [m1, m2]
        | microservice | services               |
        | m1           |                        |
        | m2           | hello: requestResponse |
        | m2           | greet$: requestStream  |
        And proxy is created from m1 ==> ms1Proxy
        When invoking ms1Proxy.greet$ (requestResponse)
        Then the data will return as Observable
  `, (done) => {
    expect.assertions(3);
    const ms1 = Microservices.create({ services: [] });
    const ms2 = Microservices.create({ services: [greetingService1] });
    const ms1Proxy = ms1.createProxy({ serviceDefinition: greetingServiceDefinition });
    ms1Proxy.greet$([0, 1, 2]).subscribe((response: any) => {
      expect(response).toMatch(FAKE_REQUEST_STREAM);
      if (response === `${FAKE_REQUEST_STREAM}2`) {
        done();
      }
    });
  });
});
