import { from } from 'rxjs';
import { Service } from '../../src/api';
import { greetingServiceDefinition } from '../mocks/GreetingService';
import GreetingService from '../mocks/GreetingService';
import Microservices from '../../src';
import { map } from 'rxjs/operators';

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

describe('Test remoteCall', () => {
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const ms1 = Microservices.create({ services: [] });
  Microservices.create({ services: [greetingService1] });

  const proxy1 = ms1.createProxy({ serviceDefinition: greetingServiceDefinition });

  test('Create transportServer for each microservice', () => {
    expect.assertions(1);
    return expect(RSOCKET_SERVER_MOCK.mock.calls).toHaveLength(2);
  });

  test('connect RSocketClient every invoke of the proxy method', () => {
    expect.assertions(1);
    proxy1.hello(defaultUser);
    return expect(RSOCKET_CLIENT_MOCK.mock.calls).toHaveLength(1);
  });

  test('connect RSocketClient every invoke of the proxy method', () => {
    expect.assertions(1);
    proxy1.greet$([`${defaultUser}1}`, `${defaultUser}2}`]);
    return expect(RSOCKET_CLIENT_MOCK.mock.calls).toHaveLength(1);
  });

  test('Using RScoket for transport', () => {
    expect.assertions(1);
    return expect(proxy1.hello(defaultUser)).resolves.toEqual(FAKE_REQUEST_RESPONSE);
  });

  test('Using RScoket for transport', (done) => {
    expect.assertions(3);
    proxy1.greet$([0, 1, 2]).subscribe((response: any) => {
      expect(response).toMatch(FAKE_REQUEST_STREAM);
      if (response === `${FAKE_REQUEST_STREAM}2`) {
        done();
      }
    });
  });
});
