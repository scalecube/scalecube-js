import { roundRobin } from '../src';
import { MicroserviceApi } from '@scalecube/api';
import { getAddress } from '@scalecube/utils';

const qualifier = 'serviceName/methodName';

let registry: any[] = [];

const lookUp = () => {
  return registry;
};

test(`Given Endpoint[]
      And a message:Message
      When call roundRobin(message)
      Then roundRobin will retrieve the next Endpoint`, // @ts-ignore
async () => {
  expect.assertions(9);

  registry = [0, 1, 2, 3, 4, 5, 6, 7].map((v) => ({ address: getAddress(`${v}`) }));

  for (let i = 0; i < 9; i++) {
    // @ts-ignore
    const endpoint: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
    expect(endpoint.address).toMatchObject(getAddress(`${i === 8 ? 0 : i}`));
  }
});

test(`Given Endpoint[]
      And a message:Message
      And call roundRobin(message)
      And roundRobin will retrieve the next Endpoint
      When the router doesn't find the previous Endpoint
      Then it will retrieve the first Endpoint`, // @ts-ignore
async () => {
  expect.assertions(3);

  registry = ['a', 'b', 'c', 'd', 'e'].map((v) => ({ address: getAddress(`${v}`) }));

  // @ts-ignore
  const endpoint: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint.address).toMatchObject(getAddress(`a`));

  registry = ['c', 'd', 'e'].map((v) => ({ address: getAddress(`${v}`) }));

  // @ts-ignore
  const endpoint2: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint2.address).toMatchObject(getAddress(`c`));

  // @ts-ignore
  const endpoint3: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint3.address).toMatchObject(getAddress(`d`));
});

test(`Given Endpoint[]
      And a message:Message
      And call roundRobin(message)
      And roundRobin will retrieve the next Endpoint even if the previous Endpoint position have been changed `, // @ts-ignore
async () => {
  expect.assertions(3);

  registry = ['a', 'b'].map((v) => ({ address: getAddress(`${v}`) }));

  // @ts-ignore
  const endpoint: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint.address).toMatchObject(getAddress(`a`));

  registry = ['1', '2', '3', 'a', 'c', 'd', 'e'].map((v) => ({ address: getAddress(`${v}`) }));

  // @ts-ignore
  const endpoint2: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint2.address).toMatchObject(getAddress(`c`));

  // @ts-ignore
  const endpoint3: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint3.address).toMatchObject(getAddress(`d`));
});

test(`Given Endpoint[] that contain only 1 Endpoint
      And a message:Message
      And call roundRobin(message)
      And roundRobin will retrieve the same Endpoint`, // @ts-ignore
async () => {
  expect.assertions(2);

  registry = ['a'].map((v) => ({ address: getAddress(`${v}`) }));

  // @ts-ignore
  const endpoint: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint.address).toMatchObject(getAddress(`a`));

  // @ts-ignore
  const endpoint3: MicroserviceApi.Endpoint = await roundRobin({ message: { qualifier, data: [] }, lookUp });
  expect(endpoint3.address).toMatchObject(getAddress(`a`));
});
