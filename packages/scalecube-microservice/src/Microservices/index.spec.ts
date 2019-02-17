import { MicroService } from './index';
import { getGreetingServiceInstance, greetingServiceMeta } from '../../__mocks__/GreetingService';
import { defaultRouter } from '../Routers/default';

describe('Testing MicroService', () => {
  const defaultUser = 'defaultUser';
  let subscriber;
  beforeEach(() => {
    subscriber && subscriber.unsubscribe();
  });

  const ms = MicroService.create({
    services: [getGreetingServiceInstance()],
  });

  it('MicroService will have asProxy method defined', () => {
    expect(ms.asProxy).toBeDefined();
  });

  it('MicroService will have asDispatcher method defined', () => {
    expect(ms.asDispatcher).toBeDefined();
  });

  describe('Creating Proxy from MicroService', () => {
    const greetingService = ms.asProxy({
      serviceContract: greetingServiceMeta,
      router: defaultRouter,
    });

    it('Invoke method that define in the contract', () => {
      expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
    });

    it('Subscribe method that define in the contract', () => {
      expect.assertions(2);
      subscriber = greetingService.greet$([`${defaultUser}1`, `${defaultUser}2`]).subscribe((res) => {
        expect(res).toMatch(defaultUser);
      });
    });
  });

  describe('Creating Dispatcher from MicroService', () => {
    const greetingDispatcher = ms.asDispatcher({
      router: defaultRouter,
    });

    it('Invoke method from dispatcher', (done) => {
      const message = {
        serviceName: 'GreetingService',
        methodName: 'hello',
        data: [defaultUser],
        proxy: null,
      };

      greetingDispatcher.invoke(message).then((response) => {
        expect(response).toEqual(`Hello ${defaultUser}`);
        done();
      });
    });

    it('Listen to method from dispatcher', () => {
      expect.assertions(2);

      const message = {
        serviceName: 'GreetingService',
        methodName: 'greet$',
        data: [[`${defaultUser}1`, `${defaultUser}2`]],
        proxy: null,
      };

      expect(
        greetingDispatcher.listen(message).subscribe((res) => {
          expect(res).toMatch(defaultUser);
        })
      );
    });

    it('dispatcher method not found', (done) => {
      const message = {
        serviceName: 'GreetingService',
        methodName: 'fakeHello',
        data: [defaultUser],
        proxy: null,
      };

      try {
        greetingDispatcher.invoke(message);
      } catch (e) {
        expect(e.message).toEqual(
          `can't find services with the request: '{"serviceName":"GreetingService","methodName":"fakeHello","data":["defaultUser"],"proxy":null}'`
        );
        done();
      }
    });
  });
});
