import { greetingServiceInstance } from '../__mocks__/GreetingService';
import { authServiceInstance } from '../__mocks__/AuthService';
import { MicroService } from '../src/MicroService';
import { defaultRouter } from '../src/Routers/default';
import { catchError, filter, map, mergeMap, reduce, tap } from 'rxjs6/operators';
import { from, iif, Observable, of } from 'rxjs6';
import { Message } from '../src/api/Message';

describe('Service proxy middleware suite', () => {
  const defaultUser = 'defaultUser';
  let subscriber;
  beforeEach(() => {
    subscriber && subscriber.unsubscribe();
  });

  it('getPreRequest$ should enrich the request - promise example', () => {
    const ms = MicroService.create({
      services: [greetingServiceInstance, greetingServiceInstance],
      getPreRequest$: (req$: Observable<Message>) => {
        return req$.pipe(
          map((req) => ({
            ...req,
            data: req.data.concat(defaultUser),
          }))
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceInstance,
      router: defaultRouter,
    });

    expect(greetingService.hello()).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('getPreRequest$ should enrich the request - stream example', () => {
    expect.assertions(3);
    const ms = MicroService.create({
      services: [greetingServiceInstance, greetingServiceInstance],
      getPreRequest$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) => {
            const [data] = [...req.data];
            return from(data).pipe(
              map((param) => param.toString()),
              filter((param: string) => param.includes(defaultUser)),
              reduce((data: any[], param: string) => [...data, param], []),
              map((data) => ({
                ...req,
                data,
              }))
            );
          }),
          map((req) => ({
            ...req,
            data: [...req.data, defaultUser],
          }))
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceInstance,
      router: defaultRouter,
    });

    subscriber = greetingService
      .greet$([`${defaultUser}1`, `${defaultUser}2`, 'filteredOut1', 'filteredOut2'])
      .subscribe((res) => {
        expect(res).toMatch(defaultUser);
      });
  });

  it('getPreRequest$ use proxy to create AuthService', () => {
    expect.assertions(1);
    const ms = MicroService.create({
      services: [greetingServiceInstance, authServiceInstance],
      getPreRequest$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) =>
            iif(
              () => req.serviceName.toLowerCase() !== 'authservice',
              of(req).pipe(
                mergeMap((req) =>
                  from(req.proxy({ serviceContract: authServiceInstance }).auth()).pipe(
                    map((response) => ({
                      originalReq: req,
                      response,
                    }))
                  )
                ),
                map((data: any) => ({
                  ...data.originalReq,
                  data: data.response
                    ? `${data.originalReq.data} connected`
                    : `${data.originalReq.data} please connect`,
                }))
              ),
              of(req)
            )
          )
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceInstance,
      router: defaultRouter,
    });

    return expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser} connected`);
  });

  it('postResponse$ use proxy to create AuthService', () => {
    expect.assertions(1);
    const ms = MicroService.create({
      services: [greetingServiceInstance, authServiceInstance],
      postResponse$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) =>
            iif(
              () => req.serviceName.toLowerCase() !== 'authservice',
              of(req).pipe(
                mergeMap((req) =>
                  from(req.proxy({ serviceContract: authServiceInstance }).auth()).pipe(
                    map((response) => ({
                      originalReq: req,
                      response,
                    }))
                  )
                ),
                map((data: any) => ({
                  ...data.originalReq,
                  data: data.response
                    ? `${data.originalReq.data} connected`
                    : `${data.originalReq.data} please connect`,
                }))
              ),
              of(req)
            )
          )
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceInstance,
      router: defaultRouter,
    });

    return expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser} connected`);
  });
});
