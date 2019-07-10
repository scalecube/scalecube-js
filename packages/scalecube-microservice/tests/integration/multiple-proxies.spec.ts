import { createMicroservice, ASYNC_MODEL_TYPES } from '../../src';
import { hello, greet$ } from '../mocks/GreetingService';
import { Observable } from 'rxjs';
import { getServiceNameInvalid } from '../../src/helpers/constants';
import { getDefaultAddress } from '../../src/helpers/utils';
import { MicroserviceApi } from '@scalecube/api';

describe(`
     Background: Resolve createProxies ONLY when the service available in the registry
     Given two valid services:  & service2
                     | service   | definition           | method                  |
                     | service1  | service1Definition   | greet : requestResponse |
                     | service2  | service2Definition   | hello : requestStream   |
     `, () => {
  const service1Definition = {
    serviceName: 'service1',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
    },
  };
  const service1: MicroserviceApi.Service = {
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

  const service2: MicroserviceApi.Service = {
    definition: service2Definition,
    reference: { greet$ },
  };

  const defaultUser = 'Me';

  const microserviceWithServices = createMicroservice({
    services: [service1, service2],
    address: getDefaultAddress(1000),
    seedAddress: getDefaultAddress(8000),
  });
  const microserviceWithoutServices = createMicroservice({ seedAddress: getDefaultAddress(1000) });
  describe.each([
    // ################# LocalCall #################
    {
      sender: microserviceWithServices,
      isRemote: false,
    },
    // ################# RemoteCall ################
    {
      sender: microserviceWithoutServices,
      isRemote: true,
    },
  ])(
    `
        Given  'sender'
               sender (microservice)           | serviceCall type
               microserviceWithServices        | # LocalCall
               microserviceWithoutServices     | # RemoteCallCall

        `,
    (connect) => {
      const { sender, isRemote } = connect;

      // @ts-ignore
      if (isRemote && global.isNodeEvn) {
        return; // TODO: RFC - remoteCall nodejs
      }

      test(`
           Scenario: Creating multiple proxies from the same microservice instance
           Given     microservice instance and valid serviceDefinitions
           When      requesting a Proxies from the microservice
           Then      a map of proxies by proxyName will be created
                     | proxy          | method                  |
                     | service1Proxy  | hello : requestResponse |
                     | service2Proxy  | greet$ : requestStream  |
           And       The proxy will resolve only when all the methods of the service will be available
  `, async () => {
        expect.assertions(3);
        const { service1Proxy, service2Proxy } = sender.createProxies({
          proxies: [
            {
              serviceDefinition: service1Definition,
              proxyName: 'service1Proxy',
            },
            {
              serviceDefinition: service2Definition,
              proxyName: 'service2Proxy',
            },
          ],
          isAsync: true,
        });

        const { proxy: proxy1 }: { proxy: { hello: (data: any) => Promise<any> } } = await service1Proxy;
        const { proxy: proxy2 }: { proxy: { greet$: (...arr: any[]) => Observable<any> } } = await service2Proxy;

        expect(proxy1.hello).toBeDefined();
        expect(proxy2.greet$).toBeDefined();

        return expect(proxy1.hello(defaultUser)).resolves.toBe(`Hello ${defaultUser}`);
      });

      test(`
           Scenario: Creating multiple proxies from the same microservice instance
           Given     microservice instance and valid serviceDefinitions
           When      requesting a Proxies from the microservice
           Then      a map of proxies by proxyName will be created
                     | proxy          | method                  |
                     | service1Proxy  | hello : requestResponse |
                     | service2Proxy  | greet$ : requestStream  |
           And       The proxy will resolve immediately
  `, () => {
        expect.assertions(3);
        const { service1Proxy: proxy1, service2Proxy: proxy2 } = sender.createProxies({
          proxies: [
            {
              serviceDefinition: service1Definition,
              proxyName: 'service1Proxy',
            },
            {
              serviceDefinition: service2Definition,
              proxyName: 'service2Proxy',
            },
          ],
          isAsync: false,
        });

        expect(proxy1.hello).toBeDefined();
        expect(proxy2.greet$).toBeDefined();

        return expect(proxy1.hello(defaultUser)).resolves.toBe(`Hello ${defaultUser}`);
      });

      test(`
           Scenario: creating multiple proxies [isAsync: true,]
           But       one of the serviceDefinition is invalid
           Given     microservice instance and serviceDefinitions
           When      requesting a Proxies from the microservice
           Then      a map of proxies by proxyName will be created
                     | proxy          | method                  | valid
                     | service1Proxy  | hello : requestResponse | yes
                     | service2Proxy  | greet$ : requestStream  | no

  `, async () => {
        expect.assertions(2);

        const { service1Proxy, service2Proxy } = sender.createProxies({
          proxies: [
            {
              serviceDefinition: service1Definition,
              proxyName: 'service1Proxy',
            },
            {
              serviceDefinition: { serviceName: {} },
              proxyName: 'service2Proxy',
            },
          ],
          isAsync: true,
        });

        const { proxy: proxy1 }: { proxy: { hello: (data: any) => Promise<any> } } = await service1Proxy;

        expect(proxy1.hello).toBeDefined();

        return expect(service2Proxy).rejects.toMatchObject(new Error(getServiceNameInvalid({})));
      });
    }
  );
});
