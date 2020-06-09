import { retryRouter } from '../src';
import { getAddress } from '@scalecube/utils';

describe(`Test retry router`, () => {
  const qualifier = 'serviceName/methodName';

  let registry: any[] = [];

  test(`
        Scenario:      registry update only after lookup.
        Given          a registry without any endPoints
        And            retry router
        When           calling lookUp registry return empty array as a result
        And            after 10ms it fills the registry with endPoint
        Then           on the next iteration of the lookUp the registry returns an endPoint.
  `, // @ts-ignore
  async () => {
    const addToRegistry = () => {
      registry = ['A'].map((v) => ({ address: getAddress(`${v}`) }));
    };

    const lookUp = () => {
      setTimeout(addToRegistry, 10);
      return registry;
    };

    expect.assertions(1);
    const router = retryRouter({ period: 10, maxRetry: 3 });

    const endPoint = await router({ message: { qualifier, data: [] }, lookUp });
    expect(endPoint).toMatchObject({ address: getAddress('A') });
  });

  test(`
       Scenario:      registry never update
       Given          a registry without any endPoints
       And            retry router with 3 retry every 10 ms
       When           calling lookUp registry return empty array as a result
       Then           after the retry reach 3 times, the router will reject with null
  `, (done) => {
    const lookUp = () => {
      return [];
    };

    expect.assertions(1);
    const router = retryRouter({ period: 10, maxRetry: 3 });

    router({ message: { qualifier, data: [] }, lookUp }).catch((result) => {
      expect(result).toBe(null);
      done();
    });
  });
});
