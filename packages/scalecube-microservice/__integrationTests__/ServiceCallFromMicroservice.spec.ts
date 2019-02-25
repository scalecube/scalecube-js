import GreetingService, { greetingServiceDefinition } from '../__mocks__/GreetingService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { Message, Service } from '../src/api/public';
import { getQualifier } from '../src/helpers/serviceData';
import { catchError } from 'rxjs6/operators';
import { of } from 'rxjs6';

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

  const greetingServiceCall = ms.createServiceCall({
    router: defaultRouter,
  });

  it('Test requestResponse(message):ServiceCallOptions', () => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: defaultUser,
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
      data: defaultUser,
    };
    greetingServiceCall.requestResponse(message).catch((error: any) => {
      expect(error.message).toMatch('asyncModel miss match, expect Promise but received Observable');
    });
  });

  it('Test requestStream(message):ServiceCallOptions', (done) => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'greet$' });
    const message: Message = {
      qualifier,
      data: [defaultUser],
    };
    greetingServiceCall.requestStream(message).subscribe((response: any) => {
      expect(response).toMatchObject({
        ...message,
        data: `greetings ${defaultUser}`,
      });
      done();
    });
  });

  it('Test requestStream(message):ServiceCallOptions - asyncModel miss match', (done) => {
    const qualifier = getQualifier({ serviceName: greetingServiceDefinition.serviceName, methodName: 'hello' });
    const message: Message = {
      qualifier,
      data: [defaultUser],
    };
    greetingServiceCall
      .requestStream(message)
      .pipe(
        catchError((error: any) => {
          expect(error.message).toMatch('asyncModel miss match, expect Observable but received Promise');
          done();
          return of({});
        })
      )
      .subscribe();
  });
});
