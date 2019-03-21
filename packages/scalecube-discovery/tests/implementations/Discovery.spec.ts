import { createDiscovery } from '../../src/Discovery/Discovery';
import { Discovery } from '../../src/api';
import { expectWithFailNow } from '../helpers/utils';

describe('Discovery tests', () => {
  beforeEach(() => {
    window.scalecube.clusters = {};
  });

  const createEndpoint = (methodIndex: number = 1, clusterIndex: number = 1, serviceIndex: number = 1) => {
    const id = methodIndex + clusterIndex;
    const serviceName = `serviceName${serviceIndex}`;
    const methodName = `methodName${id}`;
    const transport = 'transport';
    const qualifier = `${serviceName}/${methodName}`;
    const uri = `${transport}/${qualifier}`;
    const address = `address${id}`;
    return {
      uri,
      transport,
      qualifier,
      serviceName,
      methodName,
      asyncModel: 'requestResponse',
      address,
    };
  };

  const createDiscoveriesWithSameSeedAddress = (clusterIndex: number = 1) => {
    const seedAddress = `cluster${clusterIndex}`;
    const endPoint1 = createEndpoint(1, clusterIndex);
    const endPoint2 = createEndpoint(2, clusterIndex);
    const endPoint3 = createEndpoint(3, clusterIndex);
    const discovery1 = createDiscovery({ address: `address1${clusterIndex}`, seedAddress, endPoints: [endPoint1] });
    const discovery2 = createDiscovery({ address: `address2${clusterIndex}`, seedAddress, endPoints: [endPoint2] });
    const discovery3 = createDiscovery({ address: `address3${clusterIndex}`, seedAddress, endPoints: [endPoint3] });
    return {
      seedAddress,
      endPoint1,
      endPoint2,
      endPoint3,
      discovery1,
      discovery2,
      discovery3,
    };
  };

  const testNotifier = (discovery: Discovery, expectations: any[], done: any, callDoneOnLastEmit = false) => {
    let updates = 0;
    discovery.notifier.subscribe((data) => {
      expectWithFailNow(() => {
        expect(data).toEqual(expectations[updates]);
      }, done);
      updates++;
      if (expectations.length === updates && callDoneOnLastEmit) {
        done();
      }
    });
  };

  it('Every node with the same seed address joins the same cluster', () => {
    expect.assertions(3);
    const { seedAddress } = createDiscoveriesWithSameSeedAddress();
    expect(Object.keys(window.scalecube.clusters)).toEqual([seedAddress]);
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(3);
  });

  const testNodesContent = (clusterIndex: number = 1) => {
    const { seedAddress, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress(clusterIndex);
    window.scalecube.clusters[seedAddress].nodes.forEach((node, nodeIndex) => {
      expect(Object.keys(node)).toHaveLength(3);
      expect(node.address).toBe(`address${nodeIndex + 1}${clusterIndex}`);
      switch (nodeIndex) {
        case 0: {
          expect(node.endPoints).toEqual([endPoint2, endPoint3]);
          break;
        }
        case 1: {
          expect(node.endPoints).toEqual([endPoint1, endPoint3]);
          break;
        }
        case 2: {
          expect(node.endPoints).toEqual([endPoint1, endPoint2]);
        }
        default: {
          break;
        }
      }
    });
  };

  it(
    'Each node from the cluster includes all the endpoints from other nodes of the cluster except its own (for one' +
      ' cluster)',
    () => {
      expect.assertions(9);

      testNodesContent(10);
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
      expect.assertions(18);
      [10, 20].forEach(testNodesContent);
    }
  );

  it('Every node that joins the cluster notifies other nodes', (done) => {
    expect.assertions(6);

    const seedAddress = 'cluster1';
    const endPoint1 = createEndpoint(1);
    const endPoint2 = createEndpoint(2);
    const endPoint3 = createEndpoint(3);
    const discovery1 = createDiscovery({ address: 'address1', seedAddress, endPoints: [endPoint1] });

    testNotifier(discovery1, [[], [endPoint2], [endPoint2, endPoint3]], done);

    const discovery2 = createDiscovery({ address: 'address2', seedAddress, endPoints: [endPoint2] });
    testNotifier(discovery2, [[endPoint1], [endPoint1, endPoint3]], done);

    const discovery3 = createDiscovery({ address: 'address3', seedAddress, endPoints: [endPoint3] });
    testNotifier(discovery3, [[endPoint1, endPoint2]], done, true);
  });

  it('Different clusters are decoupled from each other', (done) => {
    expect.assertions(5);

    const seedAddress1 = 'cluster1';
    const seedAddress2 = 'cluster2';
    const endPoint1 = createEndpoint(1);
    const endPoint2 = createEndpoint(2);
    const endPoint3 = createEndpoint(3);
    const discovery1 = createDiscovery({ address: 'address1', seedAddress: seedAddress1, endPoints: [endPoint1] });

    let updatesForDiscovery1 = 0;
    discovery1.notifier.subscribe((data) => {
      expect(data).toEqual([]);
      updatesForDiscovery1++;
    });

    const discovery2 = createDiscovery({ address: 'address2', seedAddress: seedAddress2, endPoints: [endPoint2] });
    testNotifier(discovery2, [[], [endPoint3]], done);

    const discovery3 = createDiscovery({ address: 'address3', seedAddress: seedAddress2, endPoints: [endPoint3] });
    testNotifier(discovery3, [[endPoint2]], done);

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
    testNotifier(discovery3, [[endPoint1, endPoint2]], done);

    await discovery3.destroy();
    const discovery4 = createDiscovery({ address: 'address41', seedAddress, endPoints: [endPoint4] });
    testNotifier(discovery4, [[endPoint1, endPoint2]], done, true);
  });
});
