import { Microservices, Api, ASYNC_MODEL_TYPES } from '../../src';
import { hello, greet$ } from '../mocks/GreetingService';

describe('', () => {
  const service1Definition = {
    serviceName: 'service1',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };
  const service1: Api.Service = {
    definition: service1Definition,
    reference: { hello },
  };

  const service2Definition = {
    serviceName: 'service2',
    methods: {
      greet$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
    },
  };

  const service2: Api.Service = {
    definition: service2Definition,
    reference: { greet$ },
  };

  const microservice = Microservices.create({ services: [service1, service2] });

  test(`
  Scenario: Creating multiple proxies from the same microservice instance
  Given     microservice instance with
            |service          |definition               | method                  |
            |greetingService  |greetingServiceDefinition| greet : requestResponse |
            |helloService     |helloServiceDefinition   | hello : requestResponse |
  When      creating a Proxies from the microservice
  Then      a map of proxies by proxyName will be created
            |proxy          |method                  |
            |greetingProxy  |greet : requestResponse |
            |helloProxy     |hello : requestResponse |
  `, () => {
    // const { service1Proxy, service2Proxy }=
    //   microservice.createProxy(
    //     {
    //       service1Proxy: service2Definition,
    //       service2Proxy: service2Definition
    //     });
    //
    // service1Proxy.then((proxy : GreetingService) => proxy.greet$())
  });
});
