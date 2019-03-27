import { ReplaySubject } from 'rxjs';
import { Item } from '../api';
import { joinCluster, getCluster, leaveCluster } from './DiscoveryActions';
import { getScalecubeGlobal } from '../helpers/utils';

const scalecubeGlobal = getScalecubeGlobal();

describe('Test DiscoveryActions', () => {
  const seedAddress = 'mockAddress';

  beforeEach(() => {
    scalecubeGlobal.clusters = {};
  });

  const createDiscoveryEntity = (address = 'address') => ({
    address,
    itemsToPublish: [{ address: `${address}_service` }],
    subjectNotifier: new ReplaySubject<Item[]>(1),
  });

  test('getCluster create global namespace under scalecubeGlobal.clusters[seedAddress]', () => {
    const cluster = getCluster({ seedAddress });
    expect(cluster).toMatchObject(scalecubeGlobal.clusters[seedAddress]);
  });

  test(`Discovery doesn't report on its own items`, (done) => {
    const cluster = getCluster({ seedAddress });
    joinCluster({ ...createDiscoveryEntity(), cluster });

    cluster.discoveries[0].subjectNotifier.subscribe((items) => {
      expect(items).toHaveLength(0);
      done();
    });
  });

  test(`Discovery discover other items in the cluster`, (done) => {
    expect.assertions(3);

    const cluster = getCluster({ seedAddress });
    joinCluster({ ...createDiscoveryEntity('address1'), cluster });
    joinCluster({ ...createDiscoveryEntity('address2'), cluster });
    joinCluster({ ...createDiscoveryEntity('address3'), cluster });

    cluster.discoveries[0].subjectNotifier.subscribe((items) => {
      expect(items).toHaveLength(2);
      expect(items).toContainEqual({ address: 'address2_service' });
      expect(items).toContainEqual({ address: 'address3_service' });
      done();
    });
  });

  test(`When Discovery leave the cluster, the other discovery get update discoveredItems`, (done) => {
    expect.assertions(2);

    const cluster = getCluster({ seedAddress });
    joinCluster({ ...createDiscoveryEntity('address1'), cluster });
    joinCluster({ ...createDiscoveryEntity('address2'), cluster });
    joinCluster({ ...createDiscoveryEntity('address3'), cluster });
    leaveCluster({ address: 'address3_service', cluster });

    cluster.discoveries[0].subjectNotifier.subscribe((items) => {
      expect(items).toHaveLength(1);
      expect(items).toContainEqual({ address: 'address2_service' });
      done();
    });
  });
});
