import { createDiscovery } from '../../src/Discovery/Discovery';
import { createDiscoveriesWithSameSeedAddress, createEndpoint, testNodesContent, testNotifier } from '../helpers/utils'

describe('Discovery tests', () => {
  beforeEach(() => {
    window.scalecube.clusters = {};
  });

  it('Every node with the same seed address joins the same cluster', () => {
    expect.assertions(3);
    const { seedAddress } = createDiscoveriesWithSameSeedAddress();
    expect(Object.keys(window.scalecube.clusters)).toEqual([seedAddress]);
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(3);
  });

  it(
    'Each node from the cluster includes all the endpoints from other nodes of the cluster except its own (for one' +
      ' cluster)',
    () => {
      expect.assertions(12);
      testNodesContent();
    }
  );

  it('AllEndPoints includes all the endpoints for each node in the cluster', () => {
    expect.assertions(1);
    const { seedAddress, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress();
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toEqual([endPoint1, endPoint2, endPoint3]);
  });

  it('Nodes with different seed address join different cluster', () => {
    expect.assertions(5);
    const { seedAddress: seedAddress1 } = createDiscoveriesWithSameSeedAddress(1);
    const { seedAddress: seedAddress2 } = createDiscoveriesWithSameSeedAddress(2);
    expect(Object.keys(window.scalecube.clusters)).toEqual([seedAddress1, seedAddress2]);
    expect(window.scalecube.clusters[seedAddress1].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress1].allEndPoints).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress2].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress2].allEndPoints).toHaveLength(3);
  });

  it(
    'Each node from the cluster includes all the endpoints from other nodes of the cluster except its own (for' +
      ' multiple cluster)',
    () => {
      expect.assertions(24);
      [1, 2].forEach(testNodesContent);
    }
  );

  it('Every node that joins the cluster notifies other nodes', (done) => {
    expect.assertions(6);

    const seedAddress = 'cluster1';
    const endPoint1 = createEndpoint(1);
    const endPoint2 = createEndpoint(2);
    const endPoint3 = createEndpoint(3);

    const discovery1 = createDiscovery({ address: 'address11', seedAddress, endPoints: [endPoint1] });
    testNotifier(discovery1, [[], [endPoint2], [endPoint2, endPoint3]], done);

    const discovery2 = createDiscovery({ address: 'address21', seedAddress, endPoints: [endPoint2] });
    testNotifier(discovery2, [[endPoint1], [endPoint1, endPoint3]], done);

    const discovery3 = createDiscovery({ address: 'address31', seedAddress, endPoints: [endPoint3] });
    testNotifier(discovery3, [[endPoint1, endPoint2]], done, true);
  });

  it('Different clusters are decoupled from each other', async (done) => {
    expect.assertions(6);

    const seedAddress1 = 'cluster1';
    const seedAddress2 = 'cluster2';
    const endPoint1 = createEndpoint(1, 1);
    const endPoint2 = createEndpoint(1, 2);
    const endPoint3 = createEndpoint(2, 2);
    const discovery1 = createDiscovery({ address: 'address11', seedAddress: seedAddress1, endPoints: [endPoint1] });

    let updatesForDiscovery1 = 0;
    discovery1.notifier.subscribe((data) => {
      expect(data).toEqual([]);
      updatesForDiscovery1++;
    });

    // Check that adding new endpoints to cluster 2 doesn't affect the notifications of cluster 1
    const discovery2 = createDiscovery({ address: 'address12', seedAddress: seedAddress2, endPoints: [endPoint2] });
    testNotifier(discovery2, [[], [endPoint3], []], done);
    const discovery3 = createDiscovery({ address: 'address22', seedAddress: seedAddress2, endPoints: [endPoint3] });
    testNotifier(discovery3, [[endPoint2]], done);

    // Check that destroying discoveries related with cluster 2 doesn't affect the notifications of cluster 1
    await discovery3.destroy();
    await discovery2.destroy();

    setTimeout(() => {
      expect(updatesForDiscovery1).toBe(1);
      done();
    }, 1000);
  });

  it('Discovery.destroy will remove itself from the cluster', async () => {
    expect.assertions(6);

    const { seedAddress, endPoint2, endPoint3, discovery1, discovery2, discovery3 } = createDiscoveriesWithSameSeedAddress();
    await discovery1.destroy();
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(2);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toEqual([endPoint2, endPoint3]);
    await discovery2.destroy();
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(1);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toEqual([endPoint3]);
    await discovery3.destroy();
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(0);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(0);
  });

  it('Discovery.destroy will notify other nodes and complete the notifier', async (done) => {
    expect.assertions(8);

    const {
      seedAddress,
      endPoint1,
      endPoint2,
      endPoint3,
      discovery1,
      discovery2,
      discovery3,
    } = createDiscoveriesWithSameSeedAddress(1);
    const endPoint4 = createEndpoint(4, 1);

    testNotifier(discovery1, [[endPoint2, endPoint3], [endPoint2], [endPoint2, endPoint4]], done);
    testNotifier(discovery2, [[endPoint1, endPoint3], [endPoint1], [endPoint1, endPoint4]], done);
    // Discovery 3 will not receive update for endpoint4 added, because it will be destroyed before
    testNotifier(discovery3, [[endPoint1, endPoint2]], done);

    await discovery3.destroy();
    const discovery4 = createDiscovery({ address: 'address41', seedAddress, endPoints: [endPoint4] });
    testNotifier(discovery4, [[endPoint1, endPoint2]], done, true);
  });
});
