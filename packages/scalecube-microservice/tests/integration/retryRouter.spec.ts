import { greet$, greetingServiceDefinition, hello } from '../mocks/GreetingService';
import { createMicroservice } from '../../src';
import { retryRouter } from '@scalecube/routers';

describe('Test retry router - distributed env.', () => {
  test(`
  Scenario:  perform remoteCall from sync proxy when the remoteService is bootstrap after the localService.
  Given       2 services that are in the same dist. env. 
  And         localService is bootstrap before the remoteService.
  When        doing a remoteCall
  And         only after that the remoteService is registered.
  Then        the remoteCall will be resolved.
  `, // @ts-ignore
  async (done) => {
    const service = {
      definition: greetingServiceDefinition,
      reference: { greet$, hello },
    };

    setTimeout(() => {
      createMicroservice({
        services: [service],
        address: 'A',
      });
    }, 500);

    const msA = createMicroservice({
      address: 'B',
      seedAddress: 'A',
    });

    const router = retryRouter({ period: 10 });
    const proxy = msA.createProxy({
      serviceDefinition: greetingServiceDefinition,
      // @ts-ignore
      router,
    });

    const result = await proxy.hello('Me');
    expect(result).toMatch('Hello Me');

    proxy.greet$(['Me']).subscribe((response: any) => {
      expect(response).toMatch('greetings Me');
      done();
    });
  });
});
