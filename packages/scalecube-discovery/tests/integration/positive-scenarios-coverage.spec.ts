import { createDiscovery } from '../../src';
import { getAddress } from '@scalecube/utils';
import { DiscoveryApi } from '@scalecube/api';
import { applyPostMessagePolyfill } from '../../../scalecube-microservice/tests/mocks/utils/PostMessageWithTransferPolyfill';
import { applyMessageChannelPolyfill } from '../../../scalecube-microservice/tests/mocks/utils/MessageChannelPolyfill';

describe('Test discovery success scenarios', () => {
  // @ts-ignore
  if (!global.isNodeEvn) {
    applyPostMessagePolyfill();
    applyMessageChannelPolyfill();
  }

  const discoveryList: DiscoveryApi.Discovery[] = [];

  // @ts-ignore
  beforeEach(async (done) => {
    while (discoveryList.length > 0) {
      const discovery = discoveryList.pop();
      discovery && (await discovery.destroy());
    }
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

    createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    }).then((discoveryB: DiscoveryApi.Discovery) => {
      discoveryList.push(discoveryB);
    });

    createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    }).then((discoveryA: DiscoveryApi.Discovery) => {
      discoveryList.push(discoveryA);
      discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
        const { type, items } = discoveryEvent;
        expect(type).toBe('REGISTERED');
        items.forEach((item) => {
          expect(item).toMatch(bItem);
        });
        done();
      });
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

    createDiscovery({
      address: bAddress,
      itemsToPublish: [],
    }).then((discoveryB: DiscoveryApi.Discovery) => {
      discoveryList.push(discoveryB);
    });

    createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    }).then((discoveryA: DiscoveryApi.Discovery) => {
      discoveryList.push(discoveryA);
      discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
        const { type, items } = discoveryEvent;
        expect(type).toBe('IDLE');
        done();
      });
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
  `, // @ts-ignore
  async (done) => {
    expect.assertions(3);

    const aAddress = getAddress('A');
    const bAddress = getAddress('B');
    const bItem = 'bItemData';
    const discoveryB = await createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    });

    createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [],
    }).then((discoveryA: DiscoveryApi.Discovery) => {
      discoveryList.push(discoveryA);
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
            discoveryB.destroy();
            break;
          case 1:
            expect(type).toBe('UNREGISTERED');
            items.forEach((item) => {
              expect(item).toMatch(bItem);
              discoveryA.destroy().then(() => {
                done();
              });
            });
            break;
        }
      });
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

    createDiscovery({
      address: aAddress,
      seedAddress: bAddress,
      itemsToPublish: [aItem],
    }).then((discoveryA) => {
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
    });

    createDiscovery({
      address: bAddress,
      itemsToPublish: [],
    }).then((discoveryB) => {
      discoveryB.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
        const { type, items } = discoveryEvent;
        if (type === 'IDLE') {
          return;
        }
        counter++;
        expect(type).toBe('REGISTERED');
        if (counter === 4) {
          done();
        }
      });
    });

    createDiscovery({
      address: cAddress,
      seedAddress: bAddress,
      itemsToPublish: [cItem],
    }).then((discoveryC) => {
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
    });
  });
});
