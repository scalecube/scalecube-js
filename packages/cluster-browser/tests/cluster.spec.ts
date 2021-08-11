import { clusterSpec } from '../../api/src/cluster/tests/cluster.spec';
import { joinCluster } from '../src';
import { getAddress } from '@scalecube/utils';

describe('behavior', () => {
  test('ClusterA join C then B join C', (done) => {
    joinCluster({
      address: getAddress('SEED'),
      itemsToPublish: ['SEED'],
    });

    joinCluster({
      address: getAddress('B'),
      itemsToPublish: [],
      seedAddress: [getAddress('SEED')],
    });

    setTimeout(() => {
      const clusterC = joinCluster({
        itemsToPublish: [],
        address: getAddress('C'),
        seedAddress: [getAddress('SEED')],
      });
      setTimeout(() => {
        clusterC.getCurrentMembersData().then((items) => {
          expect(items).toEqual({
            'pm://defaultHost:8080/SEED': ['SEED'],
            'pm://defaultHost:8080/B': [],
            'pm://defaultHost:8080/C': [],
          });
          done();
        });
      }, 100);
    }, 100);
  });
  clusterSpec(joinCluster);
});
