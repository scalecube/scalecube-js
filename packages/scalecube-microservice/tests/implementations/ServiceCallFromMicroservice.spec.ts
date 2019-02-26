import GreetingService, { greetingServiceDefinition } from '../mocks/GreetingService';
import { Microservices } from '../../src/Microservices/Microservices';
import { Message, Service } from '../../src/api/public';
import { getQualifier } from '../../src/helpers/serviceData';
import { expectWithFailNow } from '../helpers/utils';
import { getNotFoundByRouterError, WRONG_DATA_FORMAT_IN_MESSAGE } from '../../src/helpers/constants';

describe('Test creating proxy from microservice', () => {
  console.warn = jest.fn(); // disable validation logs while doing this test
  console.error = jest.fn(); // disable validation logs while doing this test

  const defaultUser = 'defaultUser';
  const greetingService1: Service = {
    definition: greetingServiceDefinition,
    reference: new GreetingService(),
  };

  const ms = Microservices.create({
    services: [greetingService1],
  });
  const greetingServiceCall = ms.createServiceCall({});

  it('Test requestResponse(message):ServiceCallOptions', () => {
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

  it('Test requestResponse(message):ServiceCallOptions - asyncModel miss match', () => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'greet$' });
    const message: Message = {
      qualifier,
      data: [defaultUser],
    };
    return greetingServiceCall.requestResponse(message).catch((error: Error) => {
      expect(error.message).toMatch('asyncModel miss match, expect Promise but received Observable');
    });
  });

  it('Test requestStream(message):ServiceCallOptions', (done) => {
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

  it('Test requestStream(message):ServiceCallOptions - asyncModel miss match', (done) => {
    expect.assertions(1);

    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: [[defaultUser]],
    };
    greetingServiceCall.requestStream(message).subscribe(
      () => expect(0).toBe(1),
      (error: Error) => {
        expect(error.message).toMatch('asyncModel miss match, expect Observable but received Promise');
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

    const ms = Microservices.create({
      services: [],
    });

    const greetingServiceCall = ms.createServiceCall({});

    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: defaultUser,
    };

    return greetingServiceCall.requestResponse(message).catch((error: Error) => {
      expect(error.message).toMatch(getNotFoundByRouterError(message.qualifier));
    });
  });
});
