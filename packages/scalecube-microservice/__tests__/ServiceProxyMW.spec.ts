import { filter, map, mergeMap, reduce, tap } from 'rxjs6/operators';
import { from, iif, Observable, of } from 'rxjs6';

import { getGreetingServiceInstance, greetingServiceMeta } from '../__mocks__/GreetingService';
import { authServiceInstance, authServiceMeta } from '../__mocks__/AuthService';

import { MicroService } from '../src/MicroService';
import { defaultRouter } from '../src/Routers/default';
import { Message } from '../src/api/Message';

describe('Service proxy middleware suite', () => {
  const defaultUser = 'defaultUser';
  let subscriber;
  beforeEach(() => {
    subscriber && subscriber.unsubscribe();
  });

  /**
   * Use req.proxy go create authService,
   * Invoke authService auth to check user authentication status.
   * enrich the original req with the user authentication status.
   */
  const isUserAuthenticated = mergeMap((req: any) =>
    from(req.proxy({ serviceContract: authServiceMeta }).auth()).pipe(
      map((response) => ({
        ...req,
        data: response ? `${req.data} connected` : `${req.data} please connect`,
      }))
    )
  );

  /**
   * Return original req with filtered data : string[]
   * @param data
   * @param req
   */
  const filterReqData = ({ data, req }) =>
    from(data).pipe(
      map((param) => param.toString()),
      filter((param: string) => param.includes(defaultUser)),
      reduce((data: any[], param: string) => [...data, param], []),
      map((data) => ({
        ...req,
        data,
      }))
    );

  it('getPreRequest$ should enrich the request - promise example', () => {
    const ms = MicroService.create({
      services: [getGreetingServiceInstance(), getGreetingServiceInstance()],
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
      serviceContract: greetingServiceMeta,
      router: defaultRouter,
    });

    expect(greetingService.hello()).resolves.toEqual(`Hello ${defaultUser}`);
  });

  it('getPreRequest$ should enrich the request - stream example', () => {
    expect.assertions(3);

    const ms = MicroService.create({
      services: [getGreetingServiceInstance(), getGreetingServiceInstance()],
      getPreRequest$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) => {
            const [data] = [...req.data];
            return filterReqData({ data, req });
          }),
          map((req: any) => ({
            ...req,
            data: [[...req.data, defaultUser]],
          }))
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceMeta,
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
      services: [getGreetingServiceInstance(), authServiceInstance],
      getPreRequest$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) =>
            iif(
              () => req.serviceName.toLowerCase() !== 'authservice',
              of(req).pipe(
                map((req) => {
                  const [data] = req.data;
                  return {
                    ...req,
                    data,
                  };
                }),
                isUserAuthenticated,
                map((req: Message) => ({
                  ...req,
                  data: [req.data],
                }))
              ),
              of(req)
            )
          )
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceMeta,
      router: defaultRouter,
    });

    return expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser} connected`);
  });

  it('postResponse$ use proxy to create AuthService', () => {
    expect.assertions(1);
    const ms = MicroService.create({
      services: [getGreetingServiceInstance(), authServiceInstance],
      postResponse$: (req$: Observable<Message>) => {
        return req$.pipe(
          mergeMap((req) =>
            iif(() => req.serviceName.toLowerCase() !== 'authservice', of(req).pipe(isUserAuthenticated), of(req))
          )
        );
      },
    });

    const greetingService = ms.asProxy({
      serviceContract: greetingServiceMeta,
      router: defaultRouter,
    });

    return expect(greetingService.hello(defaultUser)).resolves.toEqual(`Hello ${defaultUser} connected`);
  });
});
