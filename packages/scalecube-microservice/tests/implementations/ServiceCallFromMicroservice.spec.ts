import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import Microservices, { ASYNC_MODEL_TYPES } from '../../src';
import { Message, Service } from '../../src/api';
import { getQualifier } from '../../src/helpers/serviceData';
import { expectWithFailNow } from '../helpers/utils';
import {
  getAsyncModelMissmatch,
  getNotFoundByRouterError,
  WRONG_DATA_FORMAT_IN_MESSAGE,
} from '../../src/helpers/constants';

describe('Test creating proxy from microservice', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  let ms: any;
  let greetingServiceCall: any;

  beforeEach(() => {
    ms = Microservices.create({
      services: [greetingService1],
    });
    greetingServiceCall = ms.createServiceCall({});
  });

  test(`
    # Test requestResponse(message):ServiceCallOptions
    Scenario: Successful requestResponse(message):ServiceCallOptions
      Given:  a Microservice with serviceDefinition and reference
              |serviceName  |method |asyncModel       |
              |greeting     |hello  |requestResponse  |
      When    creating a serviceCall
      And     message is created
              |qualifier  |greeting/hello  |
      And     invoking the serviceCall's requestResponse with the message
      Then    serviceCall's requestResponse will be invoked succesfuly
      `, () => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: [defaultUser],
    };
    return expect(greetingServiceCall.requestResponse(message)).resolves.toMatchObject({
      ...message,
      data: `Hello ${defaultUser}`,
    });
  });

  test(`
    # Test requestResponse(message):ServiceCallOptions - asyncModel miss match
    Scenario: Fail to connect to get requestResponse, asyncModel mismatch
      Given   a Microservice with serviceDefinition and reference
              |serviceName  |method |asyncModel       |
              |greeting     |hello  |requestResponse  |
      When    creating a service call
      And     message is created with qualifier and methodName
              |qualifier  |greeting/greet$  |
      Then    invalid error getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_RESPONSE, ASYNC_MODEL_TYPES.REQUEST_STREAM)
      `, () => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'greet$' });
    const message: Message = {
      qualifier,
      data: [defaultUser],
    };
    return greetingServiceCall.requestResponse(message).catch((error: Error) => {
      expect(error.message).toMatch(
        getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_RESPONSE, ASYNC_MODEL_TYPES.REQUEST_STREAM)
      );
    });
  });

  test(`
    # Test requestStream(message):ServiceCallOptions
    Scenario: Success to connect to requestStream
      Given   a Microservice with serviceDefinition and reference
              |serviceName  |method |asyncModel       |
              |greeting     |hello  |requestStream    |
      When    creating a service call
      And     message is created with qualifier and methodName
              |qualifier  |greeting/greet$  |
      Then    serviceCall's requestResponse will be invoked succesfuly
      `, (done) => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'greet$' });
    const message: Message = {
      qualifier,
      data: [[defaultUser]],
    };
    greetingServiceCall.requestStream(message).subscribe((response: Message) => {
      expectWithFailNow(
        () =>
          expect(response).toMatchObject({
            ...message,
            data: `greetings ${defaultUser}`,
          }),
        done
      );
      done();
    });
  });

  test(`
    # Test requestStream(message):ServiceCallOptions - asyncModel miss match
    Scenario: Fail to connect to get requestStream, asyncModel mismatch
      Given   a Microservice with serviceDefinition and reference
              |serviceName  |method |asyncModel       |
              |greeting     |hello  |requestStream    |
      When    creating a service call
      And     message is created with qualifier and methodName
              |qualifier  |greeting/hello  |
      Then    invalid error getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_STREAM, ASYNC_MODEL_TYPES.REQUEST_RESPONSE)
      `, (done) => {
    expect.assertions(1);

    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: [[defaultUser]],
    };
    greetingServiceCall.requestStream(message).subscribe(
      () => expect(0).toBe(1),
      (error: Error) => {
        expect(error.message).toMatch(
          getAsyncModelMissmatch(ASYNC_MODEL_TYPES.REQUEST_STREAM, ASYNC_MODEL_TYPES.REQUEST_RESPONSE)
        );
        done();
      }
    );
  });

  it('ServiceCall should fail if message data is not Array', () => {
    expect.assertions(1);

    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: defaultUser,
    };

    return greetingServiceCall.requestResponse(message).catch((error: Error) => {
      expect(error.message).toMatch(WRONG_DATA_FORMAT_IN_MESSAGE);
    });
  });

  it('ServiceCall should fail with service not found error', () => {
    expect.assertions(1);

    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'fakeHello' });
    const message: Message = {
      qualifier,
      data: defaultUser,
    };

    return greetingServiceCall.requestResponse(message).catch((error: Error) => {
      expect(error.message).toMatch(getNotFoundByRouterError(message.qualifier));
    });
  });
});
