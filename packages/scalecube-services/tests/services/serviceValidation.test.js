import { Microservices } from '../../src/services';
import GreetingService from '../../../../examples/GreetingServiceClass/GreetingService';

describe('Test Service validation requirements', () => {
  console.error = jest.fn(); // disable validation logs while doing this test

  const baseService = {
    hello: ( name ) => {
      return Promise.resolve(`Hello ${ name }`)
    }
  };

  it('Service without meta data is invalid ', () => {

    const invalidService = {
      ...baseService
    };

    const ms = Microservices.builder().services(invalidService).build();
    const serviceProxy = ms.proxy().api(invalidService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(0);
    expect(serviceProxy).toMatchObject(Error("API must have meta property"));

  });

  it('Service with invalid meta data (no serviceName) is invalid ', () => {

    const invalidService = {
      meta: {
        methods: {}
      },
      ...baseService
    };

    const ms = Microservices.builder().services(invalidService).build();
    const serviceProxy = ms.proxy().api(invalidService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(0);
    expect(serviceProxy).toMatchObject(Error("service name (api.meta.serviceName) is not defined"));

  });

  it('Service with invalid meta data (no methods) is invalid ', () => {

    const invalidService = {
      meta: {
        serviceName: ''
      },
      ...baseService
    };

    const ms = Microservices.builder().services(invalidService).build();
    const serviceProxy = ms.proxy().api(invalidService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(0);
    expect(serviceProxy).toMatchObject(Error("service name (api.meta.serviceName) is not defined"));

  });

  it('Service with invalid meta data (methods without asyncModel) is invalid ', () => {

    const invalidService = {
      meta: {
        serviceName: '',
        methods: {
          hello: {}
        }
      },
      ...baseService
    };

    const ms = Microservices.builder().services(invalidService).build();
    const serviceProxy = ms.proxy().api(invalidService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(0);
    expect(serviceProxy).toMatchObject(Error("service name (api.meta.serviceName) is not defined"));

  });

  it('Valid object literal service', () => {
    expect.assertions(2);

    const objectLiteralService = {
      meta: {
        serviceName: 'objectLiteral',
        methods: {
          hello: {
            type: 'Promise'
          }
        }
      },
      ...baseService
    };

    const ms = Microservices.builder().services(objectLiteralService).build();
    const serviceProxy = ms.proxy().api(objectLiteralService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(1);
    return expect(serviceProxy.hello('randomName')).resolves.toEqual("Hello randomName");

  });

  it('Valid class instance service ', () => {
    expect.assertions(2);

    const ms = Microservices.builder().services(new GreetingService()).build();
    const serviceProxy = ms.proxy().api(GreetingService).create();

    expect(Object.keys(ms.serviceRegistery.services)).toHaveLength(1);
    return expect(serviceProxy.hello('randomName')).resolves.toEqual("Hello randomName");

  });
});