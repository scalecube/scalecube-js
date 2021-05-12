import { joinCluster } from '../../src';
import { ClusterEvent } from '@scalecube/api/lib/cluster';
import { getFullAddress } from '@scalecube/utils';

describe('Member metadata size limit', () => {
  test('metadata size should not be limited', (done) => {
    const address1 = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8125,
      path: '',
    };

    const address2 = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8126,
      path: '',
    };

    const publish: any[] = [
      {
        'ws://192.168.0.1:1000/some/path': {
          greeting: {
            greet: 0,
            greet1: 0,
            greet2: 0,
            greet3: 0,
            greet4: 0,
            greet5: 0,
            greet6: 0,
            greet7: 0,
            greet8: 0,
          },
          stream: {
            greet0: 1,
            greet1: 1,
            greet2: 1,
            greet3: 1,
            greet4: 1,
            greet5: 1,
            greet6: 1,
            greet7: 1,
            greet8: 1,
          },
          service1: {
            greet: 0,
            greet1: 0,
            greet2: 0,
            greet3: 0,
            greet4: 0,
            greet5: 0,
            greet6: 0,
            greet7: 0,
            greet8: 0,
          },
          service2: {
            greet: 0,
            greet1: 0,
            greet2: 0,
            greet3: 0,
            greet4: 0,
            greet5: 0,
            greet6: 0,
            greet7: 0,
            greet8: 0,
          },
        },
      },
    ];

    joinCluster({
      address: address1,
      itemsToPublish: publish,
    });

    const node2 = joinCluster({
      address: address2,
      seedAddress: [address1],
      itemsToPublish: [],
    });
    node2.listen$().subscribe((res: ClusterEvent) => {
      expect(res).toMatchObject({
        from: getFullAddress(address1),
        items: publish,
        type: 'ADDED',
      });
      done();
    });
  });
});
