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

    const aAddress = getAddress('aAddress');
    const bAddress = getAddress('bAddress');
    const bItem = {
      address: bAddress,
    };

    createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    }).then((discoveryB: DiscoveryApi.Discovery) => {
      createDiscovery({
        address: aAddress,
        seedAddress: bAddress,
        itemsToPublish: [],
      }).then((discoveryA: DiscoveryApi.Discovery) => {
        discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
          const { type, items } = discoveryEvent;
          expect(type).toBe('REGISTERED');
          items.forEach((item) => {
            expect(item).toMatchObject(bItem);
          });

          discoveryA.destroy().then(() => {
            discoveryB.destroy().then(() => {
              // @ts-ignore
              done();
            });
          });
        });
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
      createDiscovery({
        address: aAddress,
        seedAddress: bAddress,
        itemsToPublish: [],
      }).then((discoveryA: DiscoveryApi.Discovery) => {
        discoveryA.discoveredItems$().subscribe((discoveryEvent: DiscoveryApi.ServiceDiscoveryEvent) => {
          const { type, items } = discoveryEvent;
          expect(type).toBe('IDLE');

          discoveryA.destroy().then(() => {
            discoveryB.destroy().then(() => done());
          });
        });
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
  `, (done) => {
    expect.assertions(3);

    const aAddress = getAddress('aAddress');
    const bAddress = getAddress('bAddress');
    const bItem = {
      address: bAddress,
    };
    createDiscovery({
      address: bAddress,
      itemsToPublish: [bItem],
    }).then((discoveryB: DiscoveryApi.Discovery) => {
      createDiscovery({
        address: aAddress,
        seedAddress: bAddress,
        itemsToPublish: [],
      }).then((discoveryA: DiscoveryApi.Discovery) => {
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
                expect(item).toMatchObject(bItem);
                discoveryA.destroy().then(() => {
                  done();
                });
              });
              break;
          }
        });
      });
    });
  });
});
