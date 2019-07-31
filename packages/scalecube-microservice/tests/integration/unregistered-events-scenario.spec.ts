import { greetingServiceDefinition, greet$, hello } from '../mocks/GreetingService';
import { createMicroservice } from '../../src';
import { getNotFoundByRouterError } from '../../src/helpers/constants';

describe(`
  Background:

    Given msB , msA
    And   msA have a open connection with msB
    And   msB have a open connection with msA
    
          | microservice | address | seedAddress | service |
          | msB          | B       |  A          | hello   |
          | msA          | A       |             |         |
          
    When msA try to do removeCall to the service hello('ME')
    Then it will resolve 'Hello ME'
    `, () => {
  test(`
  Scenario: destroy msB (registry doesn't have any 'hello' service)
    When    msB is destroyed.
    And     msA try to do removeCall to the service 'hello'
    Then    exception will occur: 'can't find services with the request: 'GreetingService/hello'`, async (done) => {
    // @ts-ignore
    expect.assertions(2);

    const service = {
      definition: greetingServiceDefinition,
      reference: { greet$, hello },
    };

    const serviceDefinition = service.definition;
    const msB = createMicroservice({
      services: [service],
      address: 'B',
      seedAddress: 'A',
    });

    const msA = createMicroservice({
      address: 'A',
    });

    const { awaitProxyB } = await msA.createProxies({
      proxies: [
        {
          proxyName: 'awaitProxyB',
          serviceDefinition,
        },
      ],
      isAsync: true,
    });

    awaitProxyB.then(({ proxy }: { proxy: { hello: (data: any) => any } }) => {
      proxy.hello('ME').then((res: any) => {
        expect(res).toMatch('Hello ME');
        msB.destroy().then(() => {
          proxy.hello('ME').catch((e: Error) => {
            expect(e.message).toMatch(getNotFoundByRouterError(`${serviceDefinition.serviceName}/hello`));
            msA.destroy();
            done();
          });
        });
      });
    });
  });
});

describe(`
  Background:
      Given msB , msA, msC
          And   msA have a open connection with msB 
          And   msB have a open connection with msA  
          And   msA have a open connection with msC 
          And   msC have a open connection with msA 
          And   msB have a open connection with msC 
          And   msC have a open connection with msB 
          
          | microservice | address | seedAddress | service |
          | msB          | B       |  A          | hello   |
          | msC          | C       |  A          | hello   |
          | msA          | A       |             |         |
`, () => {
  test(`
  Scenario: destroy msB (registry still have msA 'hello' service)
      When  msB is destroyed.
      And   msC try to do remoteCall to the service hello('ME')
      Then  service will be invoked (from msA)
      And   it will resolve 'Hello ME'

    
  Scenario: destroy msA (registry doesn't have any 'hello' service)
      When  msA is destroyed.
      And   msA try to do removeCall to the service 'hello'
      Then    exception will occur: 'can't find services with the request: 'GreetingService/hello'`, async (done) => {
    // @ts-ignore
    expect.assertions(3);

    const service = {
      definition: greetingServiceDefinition,
      reference: { greet$, hello },
    };

    const serviceDefinition = service.definition;
    const msB = createMicroservice({
      services: [service],
      address: 'B1',
      seedAddress: 'C1',
    });

    const msA = createMicroservice({
      services: [service],
      address: 'A1',
      seedAddress: 'C1',
    });

    const msC = createMicroservice({
      address: 'C1',
    });

    const { awaitProxy } = await msC.createProxies({
      proxies: [
        {
          proxyName: 'awaitProxy',
          serviceDefinition,
        },
      ],
      isAsync: true,
    });

    awaitProxy.then(({ proxy }: { proxy: { hello: (data: any) => any } }) => {
      proxy.hello('ME').then((res: any) => {
        expect(res).toMatch('Hello ME');
        msB.destroy().then(() => {
          proxy.hello('ME').then((res2: any) => {
            expect(res2).toMatch('Hello ME');
            msA.destroy().then(() => {
              proxy.hello('ME').catch((e: Error) => {
                expect(e.message).toMatch(getNotFoundByRouterError(`${serviceDefinition.serviceName}/hello`));
                msC.destroy();
                done();
              });
            });
          });
        });
      });
    });
  });
});
