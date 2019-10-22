import { greetingServiceDefinition, hello, greet$, GreetingService } from '../mocks/GreetingService';
import { createMicroservice } from '../../src';
import { getAddress, getFullAddress } from '@scalecube/utils';
import { getNotFoundByRouterError } from '../../src/helpers/constants';
import { MicroserviceApi } from '@scalecube/api';

describe(`Test positive-scenarios of usage
          RemoteCall - a microservice instance use other microservice's services.
          # 1. creating a microservice (remote) with service & serviceDefinition and with seedAddress='defaultSeedAddress'.
          # 2. creating a microservice (local) without services but with seedAddress='defaultSeedAddress'.
          # 3. discoveries discover other microservices under the same seed.
          # 4. creating a proxy || serviceCall from the local microservice instance.
          # 5. invoke || subscribe to a method successfully.
          # 6. receive response
          
`, () => {
  const defaultUser = 'defaultUser';
  const GreetingServiceObject = { hello, greet$ };

  const microservicesList: MicroserviceApi.Microservice[] = [];

  // @ts-ignore
  beforeEach((done) => {
    const removeNext = () => {
      if (microservicesList.length > 0) {
        const ms: any = microservicesList.pop();
        ms &&
          ms
            .destroy()
            .then(() => {
              removeNext();
            })
            .catch(console.warn);
      } else {
        done();
      }
    };

    removeNext();
  });

  const service = {
    definition: greetingServiceDefinition,
    reference: GreetingServiceObject,
  };

  const serviceDefinition = service.definition;
  createMicroservice({
    services: [service],
    address: getAddress('B'),
  });

  test(`
          Scenario: Testing proxy[createProxy] for a successful response.
            When  invoking requestResponse's method with valid data
            Then  successful RequestResponse is received
              `, (done) => {
    expect.assertions(2);
    const address = getAddress('createProxy-requestResponse');
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address,
      seedAddress: getAddress('B'),
      // debug: true
    });

    const proxy = microserviceWithoutServices.createProxy({ serviceDefinition });
    proxy.hello(defaultUser).catch((e: Error) => {
      expect(e.message).toMatch(
        getNotFoundByRouterError(getFullAddress(address), `${serviceDefinition.serviceName}/hello`)
      );
    });

    setTimeout(() => {
      proxy.hello(defaultUser).then((res: string) => {
        expect(res).toMatch(`Hello ${defaultUser}`);
        microservicesList.push(microserviceWithoutServices);

        done();
      });
    }, 1000);
  });

  test(`
          Scenario: Testing proxy[createProxy] for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
            `, (done) => {
    expect.assertions(2);
    const address = getAddress('createProxy-requestResponse');
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address,
      seedAddress: getAddress('B'),
    });
    microservicesList.push(microserviceWithoutServices);

    const proxy = microserviceWithoutServices.createProxy({ serviceDefinition });
    proxy.greet$([defaultUser]).subscribe(
      (res: string) => {},
      (e: Error) => {
        expect(e.message).toMatch(
          getNotFoundByRouterError(getFullAddress(address), `${serviceDefinition.serviceName}/greet$`)
        );
      }
    );

    setTimeout(() => {
      const subscription = proxy.greet$([defaultUser]).subscribe((response: any) => {
        expect(response).toEqual(`greetings ${defaultUser}`);
        subscription.unsubscribe();
        done();
      });
    }, 1000);
  });

  test(`
          Scenario: Testing proxy[createProxies] for a successful response.
            When  invoking requestResponse's method with valid data
            Then  successful RequestResponse is received
              `, (done) => {
    expect.assertions(1);
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address: getAddress('createProxies-requestResponse'),
      seedAddress: getAddress('B'),
    });
    microservicesList.push(microserviceWithoutServices);

    const { awaitProxy } = microserviceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });
    awaitProxy.then(({ proxy }: { proxy: any }) => {
      proxy.hello(defaultUser).then((res: any) => {
        expect(res).toEqual(`Hello ${defaultUser}`);
        done();
      });
    });
  });

  test(`
          Scenario: Testing proxy[createProxies] for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
            `, (done) => {
    expect.assertions(1);
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address: getAddress('createProxies-RequestStream'),
      seedAddress: getAddress('B'),
    });
    microservicesList.push(microserviceWithoutServices);

    const { awaitProxy } = microserviceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });
    awaitProxy.then(({ proxy }: { proxy: GreetingService }) => {
      const subscription = proxy.greet$([defaultUser]).subscribe((response: any) => {
        expect(response).toEqual(`greetings ${defaultUser}`);
        subscription.unsubscribe();
        done();
      });
    });
  });

  test(`
          Scenario: Testing serviceCall for a successful response.
            When  invoking serviceCall's requestResponse method with valid message
            Then  successful RequestResponse is received
            `, (done) => {
    expect.assertions(2);
    const address = getAddress('serviceCall-requestResponse');
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address,
      seedAddress: getAddress('B'),
    });
    microservicesList.push(microserviceWithoutServices);

    const message: MicroserviceApi.Message = {
      qualifier: `${serviceDefinition.serviceName}/hello`,
      data: [`${defaultUser}`],
    };
    const serviceCall = microserviceWithoutServices.createServiceCall({});

    serviceCall.requestResponse(message).catch((e: Error) => {
      expect(e.message).toMatch(
        getNotFoundByRouterError(getFullAddress(address), `${serviceDefinition.serviceName}/hello`)
      );
    });

    setTimeout(() => {
      serviceCall.requestResponse(message).then((res: MicroserviceApi.Message) => {
        expect(res).toMatch(`Hello ${defaultUser}`);
        done();
      });
    }, 1000);
  });

  test(`
          Scenario: Testing serviceCall for a successful subscription (array).
            When  subscribe to RequestStream's method with valid data/message
            Then  successful RequestStream is emitted
                  `, (done) => {
    expect.assertions(2);
    const address = getAddress('serviceCall-RequestStream');
    const microserviceWithoutServices = createMicroservice({
      services: [],
      address,
      seedAddress: getAddress('B'),
    });

    microservicesList.push(microserviceWithoutServices);

    const message: MicroserviceApi.Message = {
      qualifier: `${serviceDefinition.serviceName}/greet$`,
      data: [[`${defaultUser}`]],
    };
    const serviceCall = microserviceWithoutServices.createServiceCall({});

    serviceCall.requestStream(message).subscribe(
      (res: MicroserviceApi.Message) => {},
      (e: Error) => {
        expect(e.message).toMatch(
          getNotFoundByRouterError(getFullAddress(address), `${serviceDefinition.serviceName}/greet$`)
        );
      }
    );

    setTimeout(() => {
      const subscription = serviceCall.requestStream(message).subscribe((response: MicroserviceApi.Message) => {
        expect(response).toEqual(`greetings ${defaultUser}`);

        subscription.unsubscribe();
        done();
      });
    }, 1000);
  });
});
