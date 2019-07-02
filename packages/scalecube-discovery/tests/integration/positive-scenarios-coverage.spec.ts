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

  test(`
    Scenario: Creating distributed environment
    Background:
      Given discovery A with itemsToPublish: [a1]
      And discovery C with itemsToPublish: [c1]
      And discovery B with  itemsToPublish: [ ]
      And discovery A establish connection with B
      And discovery C establish connection with B

      When discovery A subscribes to discoveredItems$
       Then discoveredItems$ emits ServiceDiscoveryEvent
      	      | type  | 'REGISTERED' |
              | item   | c1           |

      When discovery C subscribes to discoveredItems$
       Then discoveredItems$ emits ServiceDiscoveryEvent
      	      | type   | 'REGISTERED' |
              | item   | a1           |

      When discovery B subscribes to discoveredItems$
       Then discoveredItems$ emits ServiceDiscoveryEvent with
      	      | type   | 'REGISTERED' | 'REGISTERED' |
              | item   | a1           |   c1         |


discoveryA (seed: B)            discoveryB (seed: null)             discoveryC (seed: B)
| port | items|                     | port | items                        | port  | items
| {}   |  {}  |                     | null | null                         | null  | null
|      |      | -- INIT event B --> | {}   | {}                           |       |
|      |      | 500ms (retry)       |      |                              |       |
|      |      | -- INIT event B --> | {A}  | {iA}                         |       |
| {}   |  {}  | <-- INIT event A -- |      |                              |       |
|      |      |                     |{A, C}| {iA, iC} <-- INIT event B -- | {}    | {}
|      |      |                     |      |          -- INIT event C --> | {B}   | {iA}
| {}   | {iC} | <-- ADDED event A --|      |                              |       |
|      |      |                     |      |                              |       |

  `, (done) => {
    let counter = 0;
    expect.assertions(6);
    const aAddress = getAddress('A');
    const bAddress = getAddress('B');
    const cAddress = getAddress('C');
    const aItem = 'aItemData';
    const cItem = 'cItemData';

    const discoveryA = createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [aItem],
    });

    discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      if (type === 'IDLE') {
        return;
      }
      counter++;
      expect(type).toBe('REGISTERED');

      items.forEach((item) => {
        expect(item).toMatch(cItem);
      });
      if (counter === 4) {
        done();
      }
    });

    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [],
    });

    discoveryB.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      expect(type).toBe('REGISTERED');
      if (type === 'IDLE') {
        return;
      }
      counter++;
      if (counter === 4) {
        done();
      }
    });

    const discoveryC = createDiscovery({
      address: cAddress,
      seedAddress: bAddress,
      itemsToPublish: [cItem],
    });

    discoveryC.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      if (type === 'IDLE') {
        return;
      }
      counter++;
      expect(type).toBe('REGISTERED');
      items.forEach((item) => {
        expect(item).toMatch(aItem);
      });
      if (counter === 4) {
        done();
      }
    });

    discoveryList.push(discoveryA);
    discoveryList.push(discoveryB);
    discoveryList.push(discoveryC);
  });
});
