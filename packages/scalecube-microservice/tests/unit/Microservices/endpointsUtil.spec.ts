import { restore, minimized } from '../../../src/Microservices/endpointsUtil';
import { AsyncModel } from '@scalecube/api/lib/microservice';

describe('endpointsUtil', () => {
  test('Given endpoints when minimized & restore it should be the same', () => {
    const endpoints = [
      {
        qualifier: 'GreetingService/hello',
        serviceName: 'GreetingService',
        methodName: 'hello',
        asyncModel: 'requestResponse' as AsyncModel,
        address: {
          protocol: 'pm',
          host: 'defaultHost',
          port: 8080,
          path: 'B',
        },
      },
      {
        qualifier: 'GreetingService/greet$',
        serviceName: 'GreetingService',
        methodName: 'greet$',
        asyncModel: 'requestStream' as AsyncModel,
        address: {
          protocol: 'pm',
          host: 'defaultHost',
          port: 8080,
          path: 'B',
        },
      },
      {
        qualifier: 'GreetingService/greet$',
        serviceName: 'GreetingService',
        methodName: 'greet$',
        asyncModel: 'requestStream' as AsyncModel,
        address: {
          protocol: 'pm',
          host: 'defaultHost',
          port: 1234,
          path: '',
        },
      },
    ];

    expect(endpoints).toEqual(restore(minimized(endpoints)));
  });
});
