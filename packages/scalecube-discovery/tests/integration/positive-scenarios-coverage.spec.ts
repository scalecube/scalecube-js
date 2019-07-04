import { createDiscovery } from '../../src';
import { getAddress } from '@scalecube/utils';
import { DiscoveryApi } from '@scalecube/api';

describe('Test discovery success scenarios', () => {
  const discoveryList: DiscoveryApi.Discovery[] = [];

  // @ts-ignore
  beforeEach(async (done) => {
    while (discoveryList.length > 0) {
      const discovery = discoveryList.pop();
      discovery && (await discovery.destroy());
    }
    // console.log('*********************************');
    done();
  });

  test(`
  Scenario: discoveredItems$ emits all items published by other discoveries
   Given    discovery A
   And      discovery B with itemsToPublish: [b1]
   And      establish connection between them
   When     discovery A subscribe to discoveredItems$
   Then     discoveredItems$ emits ServiceDiscoveryEvent
	          | type   | 'REGISTERED' |
            | item   | b1           |

  `, (done) => {
    expect.assertions(2);

    const aAddress = getAddress('A');
    const bAddress = getAddress('B');
    const bItem = 'bItemData';

    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    });

    const discoveryA = createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    });

    discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      expect(type).toBe('REGISTERED');

      items.forEach((item) => {
        expect(item).toMatch(bItem);
      });

      discoveryList.push(discoveryB);
      discoveryList.push(discoveryA);

      done();
    });
  });

  test(`
   Scenario: Discovery connects to other discovery which doesn't have itemsToPublish
   Given     discovery A
   And       discovery B with itemsToPublish: [ ]
   And       establish connection between them
   When      discovery A subscribe to discoveredItems$
   Then      discoveredItems$ emits ServiceDiscoveryEvent
   	         | type   | 'IDLE' |
  `, (done) => {
    expect.assertions(1);

    const aAddress = getAddress('aAddress');
    const bAddress = getAddress('bAddress');

    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [],
    });

    const discoveryA = createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    });

    discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      expect(type).toBe('IDLE');

      discoveryList.push(discoveryB);
      discoveryList.push(discoveryA);
      done();
    });
  });

  test(`
     Scenario:  discoveredItems$ emits ServiceDiscoveryEvent with type: 'UNREGISTERED' when other discovery is destroyed
     Given      discovery A
     And        discovery B with itemsToPublish: [b1]
     And        establish connection between them
     When       discovery A subscribe to discoveredItems$
     And        discovery B is destroyed
     Then       discoveredItems$ emits ServiceDiscoveryEvent
                | type   | 'UNREGISTERED' |
                | item   | b1             |
  `, (done) => {
    // @ts-ignore
    expect.assertions(3);

    const aAddress = getAddress('A');
    const bAddress = getAddress('B');
    const bItem = 'bItemData';
    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    });

    const discoveryA = createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    });

    let step = 0;
    discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      if (type === 'IDLE') {
        return;
      }

      switch (step) {
        case 0:
          expect(type).toBe('REGISTERED');
          step++;
          discoveryB.discoveredItems$().subscribe((discoveryEventB: DiscoveryApi.ServiceDiscoveryEvent) => {
            discoveryB.destroy();
          });
          break;
        case 1:
          expect(type).toBe('UNREGISTERED');

          items.forEach((item) => {
            expect(item).toMatch(bItem);
            discoveryA.destroy().then(() => {
              discoveryList.push(discoveryA);
              done();
            });
          });
          break;
      }
    });

    return;
  });
});
