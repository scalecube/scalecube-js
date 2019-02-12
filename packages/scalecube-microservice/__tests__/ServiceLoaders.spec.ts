import { MicroService } from '../src/MicroService';
import { getGreetingServiceInstance, greetingServiceMeta } from '../__mocks__/GreetingService';
import { defaultRouter } from '../src/Routers/default';

describe('Service Loaders suite', () => {
  const defaultUser = 'defaultUser';
  const importGreetingService = import('../__mocks__/GreetingService');

  describe('Service Loaders', () => {
    it('Import services - lazy', () => {
      expect.assertions(1);
      const ms = MicroService.create({
        lazyServices: [
          {
            loader: () =>
              importGreetingService
                .then((service: any) => new service.default())
                .catch((err) => console.error(new Error(`Unable to import the service ${err}`))),
            meta: greetingServiceMeta,
          },
          {
            loader: () =>
              importGreetingService
                .then((service: any) => new service.default())
                .catch((err) => console.error(new Error(`Unable to import the service ${err}`))),
            meta: greetingServiceMeta,
          },
        ],
      });

      const greetingService = ms.asProxy({
        serviceContract: greetingServiceMeta,
        router: defaultRouter,
      });

      return expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser}`);
    });

    it('Test lazyService been import only when needed', (done) => {
      expect.assertions(3);

      const mockFn = jest.fn((GreetingService) => new GreetingService.default());
      const lazyServices = [
        {
          loader: () =>
            importGreetingService
              .then((GreetingService) => mockFn(GreetingService))
              .catch((err) => console.error(new Error(`Unable to import the service ${err}`))),
          meta: greetingServiceMeta,
        },
        {
          loader: () =>
            importGreetingService
              .then((GreetingService) => mockFn(GreetingService))
              .catch((err) => console.error(new Error(`Unable to import the service ${err}`))),
          meta: greetingServiceMeta,
        },
      ];

      const greetingService = MicroService.create({
        lazyServices,
      }).asProxy({
        serviceContract: greetingServiceMeta,
        router: defaultRouter,
      });

      importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(0));
      greetingService.hello(defaultUser).then((res) => {
        importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(1));
        expect(res).toEqual(`Hello ${defaultUser}`);
        done();
      });
    });
  });

  describe('Isolate testing with console logs', () => {
    console.warn = jest.fn(); // disable validation logs while doing this test

    it('Use lazyService to load service base on logic', async (done) => {
      expect.assertions(7);

      const mockFn = jest.fn((GreetingService) => new GreetingService.default());

      const lazyServices = [
        {
          loader: (() => {
            let cache = 0;
            return () =>
              new Promise((resolve, reject) => {
                cache++;
                if (cache <= 2) {
                  importGreetingService
                    .then((GreetingService) => resolve(mockFn(GreetingService)))
                    .catch((err) => console.error(new Error(`Unable to import the service ${err}`)));
                } else {
                  reject({});
                }
              });
          })(),
          meta: greetingServiceMeta,
        },
      ];

      const greetingService = MicroService.create({
        lazyServices,
      }).asProxy({
        serviceContract: greetingServiceMeta,
        router: defaultRouter,
      });

      importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(0));
      const greetings1 = await greetingService.hello(defaultUser);
      importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(1));
      expect(greetings1).toEqual(`Hello ${defaultUser}`);

      const greetings2 = await greetingService.hello(defaultUser);
      importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(2));
      expect(greetings2).toEqual(`Hello ${defaultUser}`);

      const greetings3 = await greetingService.hello(defaultUser);
      expect(greetings3).not.toBeDefined();

      importGreetingService.then(() => expect(mockFn.mock.calls.length).toBe(2));

      done();
    });
  });

  // describe('onDemand Service Loaders', () => {
  //   it('Greeting.hello should greet Idan with hello', () => {
  //     const greetingService = Microservices
  //       .builder()
  //       .serviceLoaders(
  //         {
  //           loader: () => ({
  //             then: (func) => {
  //               ImportGreetingService
  //                 .then((GreetingService) => func(new GreetingService.default()))
  //             }
  //           }),
  //           serviceClass: GreetingService
  //         })
  //       .build()
  //       .proxy()
  //       .api(GreetingService)
  //       .create();
  //
  //     expect.assertions(1);
  //     return expect(greetingService.hello('Idan')).resolves.toEqual("Hello Idan");
  //   });
  //   it('Greeting should be loaded after calling it', (done) => {
  //     const mockFn = jest.fn((GreetingService) => new GreetingService.default());
  //     const greetingService = Microservices
  //       .builder()
  //       .serviceLoaders(
  //         {
  //           loader: () => ({
  //             then: (func) => {
  //               ImportGreetingService
  //                 .then((GreetingService) => func(mockFn(GreetingService)))
  //             }
  //           }),
  //           serviceClass: GreetingService
  //         })
  //       .build()
  //       .proxy()
  //       .api(GreetingService)
  //       .create();
  //
  //     expect.assertions(2);
  //     setTimeout(()=>{
  //       expect(mockFn.mock.calls.length).toBe(0);
  //       greetingService.hello('Idan').then(()=>{
  //         expect(mockFn.mock.calls.length).toBe(1);
  //         done();
  //       });
  //     },1000);
  //   });
  //   it('Greeting.repeatToStream should return observable of greetings ', () => {
  //     const greetingService = Microservices
  //       .builder()
  //       .serviceLoaders(
  //         {
  //           loader: () => ({
  //             then: (func) => {
  //               ImportGreetingService
  //                 .then((GreetingService) => func(new GreetingService.default()))
  //             }
  //           }),
  //           serviceClass: GreetingService
  //         })
  //       .build()
  //       .proxy()
  //       .api(GreetingService)
  //       .create();
  //
  //     expect.assertions(3);
  //     let i = 0;
  //     greetingService.repeatToStream('Hello', 'Hey', 'Yo').subscribe((item) => {
  //       switch (i) {
  //         case 0:
  //           expect(item).toBe('Hello');
  //           break;
  //         case 1:
  //           expect(item).toBe('Hey');
  //           break;
  //         case 2:
  //           expect(item).toBe('Yo');
  //           break;
  //         default:
  //           expect(0).toBe(1);
  //           break;
  //       }
  //       i = i + 1;
  //     });
  //
  //   });
  // });
});
