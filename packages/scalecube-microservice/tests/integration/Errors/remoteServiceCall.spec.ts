import { Observable, of } from 'rxjs';
import { createMS, ASYNC_MODEL_TYPES } from '../../mocks/microserviceFactory';
import {
  getAsyncModelMissmatch,
  getIncorrectServiceImplementForObservable,
  getIncorrectServiceImplementForPromise,
} from '../../../src/helpers/constants';
import { getAddress, getFullAddress } from '@scalecube/utils';

const errors = [{ message: 'mockError', extra: [1, 2, 3] }, new Error('mockError'), 'mockError', 10, {}];
let errorMessage: any;
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

  test.each(errors)(
    `
    Scenario: service reject
    Given     proxy and remoteService
    When      remoteService reject
    Then      proxy receive the error message

  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
      const proxy = microServiceWithoutServices.createProxy({
        serviceDefinition: greetingServiceDefinition,
      });

      proxy.hello('Me').catch((e: any) => {
        if (typeof e === 'object') {
          expect(e).toMatchObject(errorMessage);
        } else {
          expect(e).toBe(errorMessage);
        }
        done();
      });
    }
  );

  test.each(errors)(
    `
    Scenario: service emit error
    Given     proxy and remoteService
    When      remoteService emit error
    Then      proxy receive the error message
  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
      const proxy = microServiceWithoutServices.createProxy({
        serviceDefinition: greetingServiceDefinition,
      });

      proxy.greet$(['Me']).subscribe(
        (response: any) => {},
        (e: any) => {
          if (typeof e === 'object') {
            expect(e).toMatchObject(errorMessage);
          } else {
            expect(e).toBe(errorMessage);
          }
          done();
        }
      );
    }
  );

  test.each(errors)(
    `
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
      const proxy = microServiceWithoutServices.createProxy({
        serviceDefinition: greetingServiceDefinition,
      });

      proxy.incorrectAsyncModel('Me').catch((e: Error) => {
        expect(e.message).toMatch(
          getIncorrectServiceImplementForPromise(seedAddress, 'GreetingService/incorrectAsyncModel')
        );
        done();
      });
    }
  );

  test.each(errors)(
    `
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel reference|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
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
    }
  );

  test.each(errors)(
    `
    Scenario: service emit instead of resolve.
    Given     proxy
      And     remoteService
              | method               | asyncModel definition | asyncModel definition|
              | incorrectAsyncModel  | requestResponse       | requestStream       |
    When      remoteService emit values
    Then      proxy receive only first emit
  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
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
        (err: Error) => {
          expect(err.message).toMatch(
            getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_STREAM, ASYNC_MODEL_TYPES.REQUEST_RESPONSE)
          );
          done();
        }
      );
    }
  );

  test.each(errors)(
    `
    Scenario: service resolve instead of emit.
    Given     proxy
      And     remoteService
              | method                | asyncModel definition | asyncModel definition|
              | incorrectAsyncModel$  | requestStream         | requestResponse     |
    When      remoteService return value
    Then      proxy receive the value
  `,
    (error, done) => {
      expect.assertions(1);
      errorMessage = error;
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
    }
  );
});
