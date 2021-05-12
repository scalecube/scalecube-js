import { createDiscovery } from '../mockDiscovery';
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
    


   discoveryA (seed: B)       discoveryB (seed: D)           discoveryC (seed: B)
   | port | items|                | port | items                 | port  | items
1. | {}   |  {}  |                | null | null                  | null  | null
2. |      |      | -- INIT B -->  | {}   | {}                    |       |
3. |      |      | 500ms (retry)  |      |                       |       |
4. |      |      | -- INIT B -->  | {A}  | {iA}                  |       |
5. | {}   |  {}  | <-- INIT A --  |      |                       |       |
6. |      |      |                |{A, C}| {iA, iC} <-- INIT B --| {}    | {}
7. |      |      |                |      |          -- INIT C -->| {B}   | {iA}
8. | {}   | {iC} | <-- ADDED A -- |      |                       |       |
9. |      |      |                |      |                       |       |
10.| {}   | {iC} | -- REMOVED C --| {C}  | {iA} -- REMOVED C --> | {B}   | {}


   discoveryD (seed: null)        discoveryB (seed: D)
   | port | items |                 | port | items    
   | {}   | {}    |                 | null | null     
   |      |       | <-- INIT D --   | {}   | {}       
   | {B}  | {}    | -- INIT D -->   | {}   | {}           
4. | {B}  | {iA}  | <-- ADDED A --  | {A}  | {iA}       
5. |      |       |                 |      |      
6. |      |       |                 |{A, C}| {iA, iC}          
7. | {B}  |{iA,iC}| <-- ADDED C --  |      |    
8. |      |       |                 |      |          
10.| {B}  | {iA}  | -- REMOVED C -->| {B}  | {iA}


  `, (done) => {
    expect.assertions(11);

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

    const discoveryDRegisteredEvents: { [key: string]: any } = { [cItem]: cItem, [aItem]: aItem };
    const discoveryBRegisteredEvents: { [key: string]: any } = { [cItem]: cItem, [aItem]: aItem };
    const discoveryARegisteredEvents: { [key: string]: any } = { [cItem]: cItem, [aItem]: aItem };
    const discoveryCRegisteredEvents: { [key: string]: any } = { [aItem]: aItem, [cItem]: cItem };

    const discoveryDUnRegisteredEvents: { [key: string]: any } = { [cItem]: cItem };
    const discoveryAUnRegisteredEvents: { [key: string]: any } = { [cItem]: cItem };
    const discoveryBUnRegisteredEvents: { [key: string]: any } = { [cItem]: cItem };

    const checkDone = () => {
      if (
        Object.keys(discoveryDRegisteredEvents).length === 0 &&
        Object.keys(discoveryDUnRegisteredEvents).length === 0 &&
        Object.keys(discoveryARegisteredEvents).length === 0 &&
        Object.keys(discoveryAUnRegisteredEvents).length === 0 &&
        Object.keys(discoveryBRegisteredEvents).length === 0 &&
        Object.keys(discoveryBUnRegisteredEvents).length === 0 &&
        Object.keys(discoveryCRegisteredEvents).length === 0
      ) {
        done();
      }
    };

    discoveryD.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;

      if (type === 'IDLE') {
        return;
      }
      // console.log('DDDDDDD', discoveryEvent);
      if (type === 'REGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryDRegisteredEvents[item]).toMatch(item);
          delete discoveryDRegisteredEvents[item];
        });
      }

      if (type === 'UNREGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryDUnRegisteredEvents[item]).toMatch(item);
          delete discoveryDUnRegisteredEvents[item];
        });
      }

      checkDone();
    });

    const discoveryA = createDiscovery({
      address: aAddress,
      seedAddress: [bAddress],
      itemsToPublish: [aItem],
    });

    discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;

      if (type === 'IDLE') {
        return;
      }
      // console.log('AAAAAAA', discoveryEvent);
      if (type === 'REGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryARegisteredEvents[item]).toMatch(item);
          delete discoveryARegisteredEvents[item];
        });
      }

      if (type === 'UNREGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryAUnRegisteredEvents[item]).toMatch(item);
          delete discoveryAUnRegisteredEvents[item];
        });
      }

      checkDone();
    });

    const discoveryB = createDiscovery({
      address: bAddress,
      itemsToPublish: [],
      seedAddress: [dAddress],
    });

    discoveryB.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;

      if (type === 'IDLE') {
        return;
      }
      // console.log('BBBBBBB', discoveryEvent);
      if (type === 'REGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryBRegisteredEvents[item]).toMatch(item);
          delete discoveryBRegisteredEvents[item];
        });
      }

      if (type === 'UNREGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryBUnRegisteredEvents[item]).toMatch(item);
          delete discoveryBUnRegisteredEvents[item];
        });
      }

      checkDone();
    });

    const discoveryC = createDiscovery({
      address: cAddress,
      seedAddress: [bAddress],
      itemsToPublish: [cItem],
    });

    discoveryC.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
      const { type, items } = discoveryEvent;
      // console.log('CCCCCCCCC', discoveryEvent);
      if (type === 'IDLE') {
        return;
      }

      if (type === 'REGISTERED') {
        items.forEach((item: string) => {
          expect(discoveryCRegisteredEvents[item]).toMatch(item);
          delete discoveryCRegisteredEvents[item];
          if (item === 'aItemData') {
            discoveryC.destroy();
          }
        });
      }
    });
  });
});
