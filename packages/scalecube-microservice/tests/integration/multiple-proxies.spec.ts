import { Microservices, Api, ASYNC_MODEL_TYPES } from '../../src';
import { hello, greet$ } from '../mocks/GreetingService';
import { applyPostMessagePolyfill } from '../mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../mocks/utils/MessageChannelPolyfill';
import { Observable } from 'rxjs';
import { getServiceNameInvalid } from '../../src/helpers/constants';

// @ts-ignore
if (!global.isNodeEvn) {
  applyPostMessagePolyfill();
  applyMessageChannelPolyfill();
}

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

const defaultUser = 'Me';

describe(`
     Background: Resolve requestProxies ONLY when the service available in the registry
     Given two valid services:  & service2
                     | service   | definition           | method                  |
                     | service1  | service1Definition   | greet : requestResponse |
                     | service2  | service2Definition   | hello : requestStream   |
     `, () => {
  const microserviceWithServices = Microservices.create({ services: [service1, service2] });
  const microserviceWithoutSerrvices = Microservices.create({});
  describe.each([
    // ################# LocalCall #################
    {
      sender: microserviceWithServices,
      isRemote: false,
    },
    // ################# RemoteCall ################
    {
      sender: microserviceWithoutSerrvices,
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
           And       The methods of the service will be available to use from the proxy
  `, async () => {
        expect.assertions(3);
        const { service1Proxy, service2Proxy } = sender.requestProxies({
          service1Proxy: service1Definition,
          service2Proxy: service2Definition,
        });

        const { proxy: proxy1 }: { proxy: { hello: (data: any) => Promise<any> } } = await service1Proxy;
        const { proxy: proxy2 }: { proxy: { greet$: (...arr: any[]) => Observable<any> } } = await service2Proxy;

        expect(proxy1.hello).toBeDefined();
        expect(proxy2.greet$).toBeDefined();

        return expect(proxy1.hello(defaultUser)).resolves.toBe(`Hello ${defaultUser}`);
      });

      test(`
           Scenario: creating multiple proxies 
           But       one of the serviceDefinition is invalid
           Given     microservice instance and serviceDefinitions
           When      requesting a Proxies from the microservice
           Then      a map of proxies by proxyName will be created
                     | proxy          | method                  | valid
                     | service1Proxy  | hello : requestResponse | yes
                     | service2Proxy  | greet$ : requestStream  | no
           
  `, async () => {
        expect.assertions(2);
        const { service1Proxy, service2Proxy } = sender.requestProxies({
          service1Proxy: service1Definition,
          service2Proxy: { serviceName: {} },
        });

        const { proxy: proxy1 }: { proxy: { hello: (data: any) => Promise<any> } } = await service1Proxy;

        expect(proxy1.hello).toBeDefined();

        return expect(service2Proxy).rejects.toMatchObject(new Error(getServiceNameInvalid({})));
      });
    }
  );
});
