import { bootstrap } from '../src/sandbox/bootstrap';
import { createGatewayProxy } from '@scalecube/rsocket-ws-gateway-client';
import { SandboxAPI, SandboxDefinition } from '../src/sandbox/sandbox';
import { RegistryAPI, RegistryDefinition } from '../src/sandbox/registry';
import { bootstrap as fixture } from './fixture/bootstrap';
import { concat, from, merge } from 'rxjs';
import { switchMap, map, mergeAll, tap, takeWhile, finalize } from 'rxjs/operators';
import { AsyncModel, Message } from '@scalecube/api/lib/microservice';

describe('sandbox spec', () => {
  let proxies: any;
  beforeAll(async () => {
    fixture({
      address: 'ws://127.0.0.1:12001/',
      seed: 'ws://127.0.0.1:12000/',
      agent: 9099,
    });
    bootstrap({
      gateway: 12012,
      seed: 'ws://127.0.0.1:10001/',
      address: 'ws://127.0.0.1:10002/',
    });
    const p = new Promise((resolve) => setTimeout(resolve, 1000));
    await p;
    const [sandbox, registry] = await createGatewayProxy('ws://127.0.0.1:12012/', [
      SandboxDefinition,
      RegistryDefinition,
    ]);
    proxies = {
      sandbox: sandbox as SandboxAPI,
      registry: registry as RegistryAPI,
    };
    proxies.registry.register({
      type: 'Service',
      service: {
        name: 'Hello',
        methods: {},
        metadata: {},
      },
    });
    proxies.registry.register({
      type: 'Env',
      env: {
        agent: 'ws://172.0.0.1:12999',
        name: 'test',
        metadata: {},
      },
    });
  });
  test('agent', (done) => {
    from(
      createGatewayProxy('ws://127.0.0.1:9099/', {
        serviceName: 'sandboxAgent',
        methods: {
          invoke: {
            asyncModel: 'requestStream',
          },
        },
      })
    )
      .pipe(
        switchMap((a) => {
          return a.invoke({
            asyncModel: 'requestResponse',
            message: {
              qualifier: 'GreetingService/greet',
              data: [],
            },
          });
        })
      )
      .pipe(
        tap(console.log),
        tap(() => done())
      )
      .subscribe();
  });
  // test("registry alive",  (done) => {
  //     (async () => {
  //         await proxies.registry.register({
  //             type: 'Service',
  //             service: {
  //                 name: 'Hello',
  //                 methods: {},
  //                 metadata: {}
  //             }
  //         });
  //         proxies.registry.list$({})
  //             .pipe(
  //                 tap(() => done())
  //             )
  //             .subscribe()
  //     })()
  //
  // });
  test('registry alive', (done) => {
    proxies.registry
      .list$({})
      .pipe(
        //tap(console.log),
        tap((i: any) => i.type === 'Env' && i.env.name === 'test' && done())
      )
      .subscribe();
  });
  test('sandbox alive', (done) => {
    expect.assertions(3);
    const logs$ = proxies.sandbox.log$().pipe(takeWhile((i: string) => i.indexOf('Hello') === -1));

    const env$ = proxies.sandbox.env$().pipe(
      tap((i: any) => i.name === 'test' && expect(1).toBe(1)),
      takeWhile((i: any) => i.name !== 'test')
    );
    const services$ = proxies.sandbox.services$().pipe(
      tap((i: any) => i.name === 'Hello' && expect(1).toBe(1)),
      takeWhile((i: any) => i.name !== 'Hello')
    );
    const invoke$ = proxies.sandbox
      .invoke({
        agent: 'ws://127.0.0.1:9099/',
        message: {
          qualifier: 'GreetingService/greet',
          data: ['Bob'],
        },
        asyncModel: 'requestResponse',
      })
      .pipe(tap((i) => expect(i).toBe('Hello Bob')));
    merge(env$, services$, logs$, invoke$)
      .pipe(finalize(() => done()))
      .subscribe();
  });
});
