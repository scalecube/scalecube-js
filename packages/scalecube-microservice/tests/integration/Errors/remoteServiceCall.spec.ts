import { Observable, of } from 'rxjs';
import { createMS, ASYNC_MODEL_TYPES } from '../../mocks/microserviceFactory';
import {
  getAsyncModelMissmatch,
  getIncorrectServiceImplementForObservable,
  getIncorrectServiceImplementForPromise,
} from '../../../src/helpers/constants';
import { getAddress, getFullAddress } from '@scalecube/utils';

const errorMessage = { message: 'mockError', extra: [1, 2, 3] };
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

  const seedAddress = getFullAddress(getAddress('seed'));

  createMS({
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
    address: seedAddress,
    debug: false,
  });

  const microServiceWithoutServices = createMS({ seedAddress, address: 'local', debug: false });

  // @ts-ignore
  if (global.isNodeEvn) {
    return; // TODO: RFC - remoteCall nodejs
  }

  test(`
    Scenario: service reject
    Given     proxy and remoteService
    When      remoteService reject
    Then      proxy receive the error message

  `, (done) => {
    expect.assertions(1);
    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: greetingServiceDefinition,
    });

    proxy.hello('Me').catch((e: any) => {
      expect(e).toMatchObject(errorMessage);
      done();
    });
  });

  test(`
    Scenario: service emit error
    Given     proxy and remoteService
    When      remoteService emit error
    Then      proxy receive the error message
  `, (done) => {
    expect.assertions(1);

    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: greetingServiceDefinition,
    });

    proxy.greet$(['Me']).subscribe(
      (response: any) => {},
      (error: any) => {
        expect(error).toMatchObject(errorMessage);
        done();
      }
    );
  });

  test(`
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `, (done) => {
    expect.assertions(1);
    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: greetingServiceDefinition,
    });

    proxy.incorrectAsyncModel('Me').catch((e: Error) => {
      expect(e.message).toMatch(
        getIncorrectServiceImplementForPromise(seedAddress, 'GreetingService/incorrectAsyncModel')
      );
      done();
    });
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
    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: greetingServiceDefinition,
    });

    proxy.incorrectAsyncModel$().subscribe(
      () => {},
      (e: Error) => {
        expect(e.message).toMatch(
          getIncorrectServiceImplementForObservable(seedAddress, 'GreetingService/incorrectAsyncModel$')
        );
        done();
      }
    );
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
    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: {
        serviceName: 'GreetingService',
        methods: {
          hello: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_STREAM,
          },
        },
      },
    });

    proxy.hello().subscribe(
      () => {},
      (error: Error) => {
        expect(error.message).toMatch(
          getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_STREAM, ASYNC_MODEL_TYPES.REQUEST_RESPONSE)
        );
        done();
      }
    );
  });

  test(`
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel definition|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `, (done) => {
    expect.assertions(1);
    const proxy = microServiceWithoutServices.createProxy({
      serviceDefinition: {
        serviceName: 'GreetingService',
        methods: {
          greet$: {
            asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
          },
        },
      },
    });
    proxy.greet$(['Me']).catch((e: Error) => {
      expect(e).toMatchObject(
        new Error(getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_RESPONSE, ASYNC_MODEL_TYPES.REQUEST_STREAM))
      );
      done();
    });
  });
});
