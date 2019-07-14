import { greetingServiceDefinition, greet$, hello } from '../mocks/GreetingService';
import { createMicroservice } from '../../src';
import { getNotFoundByRouterError } from '../../src/helpers/constants';

describe(`
  Background:
    Given msB with service
            With address 'B', seedAddress: 'A'
    And   msA without any service 'hello'
            With address 'A'.
    And   msA connected to msB

    When msA try to do removeCall to the service 'hello'
    Then it will resolve correctly
    `, () => {
  test(`
  Scenario: destroy msB (registry doesn't have any 'hello' service)
    When msB is destroyed.
    And msA try to do removeCall to the service 'hello'
    Then exception will occur.`, // @ts-ignore
  async (done) => {
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
      Given msA with service hello
        With address 'A', seedAddress: 'C'

      And msB with service hello
        With address 'B', seedAddress: 'C'

      And msC without any service 
        With address 'C'.

      And msA, msB, msC are connected.
`, () => {
  test(`
  Scenario: destroy msB (registry still have msA 'hello' service)
      When msB is destroyed.
      And msC try to do remoteCall to the service s1
      Then service will be invoked (from msA)

  Scenario: destroy msA (registry doesn't have any 'hello' service)
      When msA is destroyed.
      And msA try to do removeCall to the service 'hello'
      Then exception will occur.`, // @ts-ignore
  async (done) => {
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
