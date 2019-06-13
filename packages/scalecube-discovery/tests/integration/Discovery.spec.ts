import { expectWithFailNow } from '../helpers/utils';
import { getAddressCollision, getDiscoverySuccessfullyDestroyedMessage } from '../../src/helpers/const';
import createDiscovery from '../../src/index';
import { Discovery } from '../../src/api';
import { getScalecubeGlobal } from '../../src/helpers/utils';

const scalecubeGlobal = getScalecubeGlobal();

const getAddress = (port: number) => ({
  host: 'host',
  port,
  path: 'path',
  protocol: 'pm',
  fullAddress: `pm://host:${port}/path`,
});

describe('Discovery tests', () => {
  beforeEach(() => {
    scalecubeGlobal.clusters = {};
  });

  test(`Scenario: Create 3 discoveries with the same seed
  Given seed address 
    And no discoveries were created before
   When creating discoveries 
      |  Discovery  |  endpoints |
      |  1  |  1           |
      |  2  |  2           |
      |  3  |  3           |  
   Then discoveries  will have endpoints:
      |  Discovery  |  endpoints |
      |  1  |  2,3       |
      |  2  |  1,3       |
      |  3  |  1,2       |
  `, (done) => {
    expect.assertions(6);
    let counter = 0;
    const [discovery1, itemToPublish1, discovery2, itemToPublish2, discovery3, itemToPublish3] = [{}, {}, {}].reduce(
      (acc: any[], v: any, i: number) => {
        const itemToPublish = {
          address: getAddress(i),
        };
        acc.push(
          createDiscovery({
            address: getAddress(i),
            seedAddress: getAddress(8000),
            itemsToPublish: [itemToPublish],
          })
        );
        acc.push(itemToPublish);
        return acc;
      },
      []
    ) as any[];

    (discovery1 as Discovery).discoveredItems$().subscribe((items) => {
      items.forEach((item) => {
        expectWithFailNow(() => expect([itemToPublish2, itemToPublish3]).toContainEqual(item), done);
        counter++;
      });
    });

    (discovery2 as Discovery).discoveredItems$().subscribe((items) => {
      items.forEach((item) => {
        expectWithFailNow(() => expect([itemToPublish1, itemToPublish3]).toContainEqual(item), done);
        counter++;
      });
    });

    (discovery3 as Discovery).discoveredItems$().subscribe((items) => {
      items.forEach((item) => {
        expectWithFailNow(() => expect([itemToPublish1, itemToPublish2]).toContainEqual(item), done);
        counter++;
        if (counter === 6) {
          done();
        }
      });
    });
  });

  test(`Scenario: Create multiple discoveries with different seed
  Given 2 seed addresses
    And no discoveries were created before
   When creating discoveries
      |  Discovery  |  endpoints | seedAddress
      |  11  |  11           | 1 | 8121
      |  12  |  12          | 1 | 8121
      |  21  |  21           | 2 | 8122
      |  22  |  22           | 2 |8122
   Then discoveries will have endpoints:
      |  Discovery  |  endpoints |
      |  11  |  12       |
      |  21  |  22       |
   But 11 shouldn't have endpoint 22
   `, (done) => {
    expect.assertions(2);
    let counter = 0;
    const [
      discovery11,
      itemToPublish11,
      discovery12,
      itemToPublish12,
      discovery21,
      itemToPublish21,
      discovery22,
      itemToPublish22,
    ] = [{}, {}, {}].reduce((acc: any[], v: any, i: number) => {
      const itemToPublish1 = { address: getAddress(Number(`${i}1`)) };
      const itemToPublish2 = { address: getAddress(Number(`${i}2`)) };

      acc.push(
        createDiscovery({
          address: getAddress(Number(`${i}1`)),
          seedAddress: getAddress(Number(`8${i}21`)),
          itemsToPublish: [itemToPublish1],
        })
      );

      acc.push(itemToPublish1);

      acc.push(
        createDiscovery({
          address: getAddress(Number(`${i}2`)),
          seedAddress: getAddress(Number(`8${i}21`)),
          itemsToPublish: [itemToPublish2],
        })
      );

      acc.push(itemToPublish2);

      return acc;
    }, []) as any[];

    (discovery11 as Discovery).discoveredItems$().subscribe((items) => {
      expectWithFailNow(() => expect(items).toContainEqual(itemToPublish12), done);
      expectWithFailNow(() => expect(items).not.toContainEqual(itemToPublish22), done);
      counter++;
      done();
    });
  });

  test(`Scenario: remove discovery from the cluster
  Given seed address
    And no discoveries were created before
   When creating discoveries
      |  Discovery  |  endpoints |
      |  1  |  1           | 8000
      |  2  |  2           | 8000
      |  3  |  3           | 8000
   Then discoveries  will have endpoints:
      |  Discovery  |  endpoints |
      |  1  |  2,3       |
      |  2  |  1,3       |
      |  3  |  1,2       |
   When destroy discovery1
   Then discoveries  will have endpoints:
      |  Discovery  |  endpoints |
      |  2  |  3       |
      `, (done) => {
    expect.assertions(4);

    let destroyFlag = false;
    const [discovery1, itemToPublish1, discovery2, itemToPublish2, discovery3, itemToPublish3] = [{}, {}, {}].reduce(
      (acc: any[], v: any, i: number) => {
        const itemToPublish = { address: getAddress(i) };
        acc.push(
          createDiscovery({
            address: getAddress(i),
            seedAddress: getAddress(8000),
            itemsToPublish: [itemToPublish],
          })
        );
        acc.push(itemToPublish);
        return acc;
      },
      []
    ) as any[];
    (discovery2 as Discovery).discoveredItems$().subscribe((items) => {
      if (!destroyFlag) {
        expectWithFailNow(() => expect(items).toContainEqual(itemToPublish3), done);
        expectWithFailNow(() => expect(items).toContainEqual(itemToPublish1), done);
        done();
      } else {
        expectWithFailNow(() => expect(items).toContainEqual(itemToPublish3), done);
        expectWithFailNow(() => expect(items).not.toContainEqual(itemToPublish1), done);
      }
    });

    destroyFlag = true;
    discovery1.destroy();
  });

  test(`Scenario: remove discovery from the cluster
  Given seed address
    And no discoveries were created before
   When creating discovery
    And then destroy it
   Then correct message will be received`, async () => {
    expect.assertions(1);

    const address = getAddress(1);
    const seedAddress = getAddress(2);
    const discovery1 = createDiscovery({
      address,
      seedAddress,
      itemsToPublish: [{ address }],
    });

    return expect(discovery1.destroy()).resolves.toBe(getDiscoverySuccessfullyDestroyedMessage(address, seedAddress));
  });

  test(`Scenario: address and seedAddress are the same
  Given seed address
    And address
    And they are the same
   When creating discovery
   Then error will be thrown`, () => {
    expect.assertions(1);

    const address = getAddress(1);
    const seedAddress = getAddress(1);
    try {
      createDiscovery({
        address,
        seedAddress,
        itemsToPublish: [],
      });
    } catch (e) {
      expect(e.message).toMatch(getAddressCollision(address, seedAddress));
    }
  });
});
