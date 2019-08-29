import { Observable, of } from 'rxjs';
import { ASYNC_MODEL_TYPES, createMicroservice } from '../../../src';
import { GreetingService } from '../../mocks/GreetingService';
import { getAsyncModelMissmatch } from '../../../src/helpers/constants';

const errorMessage = new Error('mockError');
const emptyMessage = 'mockEmpty';

describe(`Test RSocket doesn't hide remoteService errors`, () => {
  const greetingServiceDefinition = {
    serviceName: 'GreetingService',
    methods: {
      hello: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
      greet$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
      incorrectAsyncModel: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
      },
      incorrectAsyncModel$: {
        asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
      },
    },
  };

  createMicroservice({
    services: [
      {
        definition: greetingServiceDefinition,
        reference: {
          // @ts-ignore
          hello: () => Promise.reject(errorMessage),
          greet$: () =>
            new Observable((obs) => {
              obs.error(errorMessage);
            }),
          incorrectAsyncModel: () => of({ emptyMessage }),
          // @ts-ignore
          incorrectAsyncModel$: () => Promise.resolve({ emptyMessage }),
        },
      },
    ],
    address: 'seed',
  });

  const microServiceWithoutServices = createMicroservice({ seedAddress: 'seed', address: 'local' });

  // @ts-ignore
  if (global.isNodeEvn) {
    return; // TODO: RFC - remoteCall nodejs
  }

  test(`
    Scenario: service reject
    Given     proxy and remoteService
    When      remoteService reject
    Then      proxy receive the error message

  `, async () => {
    expect.assertions(1);
    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: greetingServiceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });
    const { proxy: service } = await awaitProxy;

    return expect(service.hello('Me')).rejects.toMatchObject(errorMessage);
  });

  test(`
    Scenario: service emit error
    Given     proxy and remoteService
    When      remoteService emit error
    Then      proxy receive the error message
  `, (done) => {
    expect.assertions(1);

    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: greetingServiceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });

    awaitProxy.then(({ proxy }: { proxy: GreetingService }) => {
      proxy.greet$(['Me']).subscribe(
        (response: any) => {},
        (error: string) => {
          expect(error).toMatchObject(errorMessage);
          done();
        }
      );
    });
  });

  test(`
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `, async () => {
    expect.assertions(1);
    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: greetingServiceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });

    const { proxy } = await awaitProxy;
    return expect(proxy.incorrectAsyncModel('Me')).resolves.toMatchObject({ emptyMessage });
  });

  test(`
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `, (done) => {
    expect.assertions(1);
    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: greetingServiceDefinition,
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });

    awaitProxy.then(({ proxy }: any) => {
      proxy.incorrectAsyncModel$().subscribe((res: any) => {
        expect(res).toMatchObject({ emptyMessage });
        done();
      });
    });
  });

  test(`
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel definition|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `, (done) => {
    expect.assertions(1);
    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: {
            serviceName: 'GreetingService',
            methods: {
              hello: {
                asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
              },
            },
          },
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });

    awaitProxy.then(({ proxy: serviceProxy }: any) => {
      serviceProxy.hello().subscribe(
        () => {},
        (error: Error) => {
          expect(error.message).toMatch(
            getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_STREAM, ASYNC_MODEL_TYPES.REQUEST_RESPONSE)
          );
          done();
        }
      );
    });
  });

  test(`
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel definition|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `, async () => {
    expect.assertions(1);
    const { awaitProxy } = microServiceWithoutServices.createProxies({
      proxies: [
        {
          serviceDefinition: {
            serviceName: 'GreetingService',
            methods: {
              greet$: {
                asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
              },
            },
          },
          proxyName: 'awaitProxy',
        },
      ],
      isAsync: true,
    });

    const { proxy } = await awaitProxy;
    return expect(proxy.greet$(['Me'])).rejects.toMatchObject(
      new Error(getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_RESPONSE, ASYNC_MODEL_TYPES.REQUEST_STREAM))
    );
  });
});
