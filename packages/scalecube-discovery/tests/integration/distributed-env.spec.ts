import { createDiscovery } from '../../src';
import { getAddress } from '@scalecube/utils';
import { DiscoveryApi } from '@scalecube/api';

describe(`
    Scenario: Creating distributed environment
    Background:
      Given discovery A with itemsToPublish: [a1]
      And discovery C with itemsToPublish: [c1]
      And discovery B with  itemsToPublish: [ ]
      And discovery D with itemsToPublish: [ ]
      And discovery B establish connection with D
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
              
      When discovery D subscribes to discoveredItems$
       Then discoveredItems$ emits ServiceDiscoveryEvent with
      	      | type   | 'REGISTERED' | 'REGISTERED' |
              | item   | a1           |   c1         |
              `, () => {
  test(`
    


   discoveryA (seed: B)            discoveryB (seed: D)                 discoveryC (seed: B)
   | port | items|                     | port | items                        | port  | items
1. | {}   |  {}  |                     | null | null                         | null  | null
2. |      |      | -- INIT event B --> | {}   | {}                           |       |
3. |      |      | 500ms (retry)       |      |                              |       |
4. |      |      | -- INIT event B --> | {A}  | {iA}                         |       |
5. | {}   |  {}  | <-- INIT event A -- |      |                              |       |
6. |      |      |                     |{A, C}| {iA, iC} <-- INIT event B -- | {}    | {}
7. |      |      |                     |      |          -- INIT event C --> | {B}   | {iA}
8. | {}   | {iC} | <-- ADDED event A --|      |                              |       |
9. |      |      |                     |      |                              |       |

   discoveryD (seed: nul)            discoveryB (seed: D)
   | port | items |                     | port | items    
   | {}   | {}    |                     | null | null     
   |      |       | <-- INIT event D -- | {}   | {}       
   | {B}  | {}    | -- INIT event D --> | {}   | {}           
4. | {B}  | {iA}  | <-- ADDED event A --| {A}  | {iA}       
5. |      |       |                     |      |      
6. |      |       |                     |{A, C}| {iA, iC}          
7. | {B}  |{iA,iC}| <-- ADDED event C --|      |          
8. |      |       |                     |      |          



  `, (done) => {
    let counter = 0;
    expect.assertions(8);

    const aAddress = getAddress('A');
    const bAddress = getAddress('B');
    const cAddress = getAddress('C');
    const dAddress = getAddress('D');
    const aItem = 'aItemData';
    const cItem = 'cItemData';

    const discoveryD = createDiscovery({
      address: dAddress,
      itemsToPublish: [],
    });

    discoveryD.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;

      if (type === 'IDLE') {
        return;
      }

      counter++;
      expect(type).toBe('REGISTERED');
      if (counter === 6) {
        done();
      }
    });

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
      if (counter === 6) {
        done();
      }
    });

    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [],
      seedAddress: dAddress,
    });

    discoveryB.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      if (type === 'IDLE') {
        return;
      }
      counter++;
      expect(type).toBe('REGISTERED');
      if (counter === 6) {
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
      if (counter === 6) {
        done();
      }
    });
  });
});
