import { defaultRouter } from '../src';
import { MicroserviceApi } from '@scalecube/api';
import { getAddress } from '@scalecube/utils';

const qualifier = 'serviceName/methodName';

const registry = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => ({ address: getAddress(`${v}`) }));

const lookUp = () => {
  return registry;
};

test(`Given Endpoint[]
      And a message:Message
      When call defaultRouter(message)
      Then defaultRouter will retrieve the same Endpoint`, () => {
  expect.assertions(2);

  // @ts-ignore
  const endpont1: MicroserviceApi.Endpoint = defaultRouter({ message: { qualifier, data: [] }, lookUp });
  // @ts-ignore
  const endpont2: MicroserviceApi.Endpoint = defaultRouter({ message: { qualifier, data: [] }, lookUp });
  // @ts-ignore
  const endpont3: MicroserviceApi.Endpoint = defaultRouter({ message: { qualifier, data: [] }, lookUp });

  expect(endpont1).toMatchObject(endpont2);
  expect(endpont1).toMatchObject(endpont3);
});
