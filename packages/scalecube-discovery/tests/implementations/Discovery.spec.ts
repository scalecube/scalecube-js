import { createDiscovery } from "../../src/Discovery/Discovery";

describe('test', () => {
  beforeEach(() => {
    window.scalecube.clusters = {};
  });

  const endPoint = {
    uri: '',
    transport: '',
    qualifier: 'serviceName/methodName',
    serviceName: 'serviceName',
    methodName: 'methodName1',
    asyncModel: 'requestResponse',
    address: '',
  };

  const address = 'global';

  // node - discovery node

  // 1. Every node with the same seed address join the same cluster
  // 2. Nodes with different seed address join different cluster
  // 3. Different clusters are decoupled from each other
  // 4. Every node that joins the cluster notifies other nodes
  // 5. Discovery.destroy will remove remove itself from the cluster, notify other nodes and complete the notifier

  const createDiscoveriesWithSameSeedAddress = () => {
    const seedAddress = 'cluster1';
    const endPoint1 = { ...endPoint, methodName: 'methodName1' };
    const endPoint2 = { ...endPoint, methodName: 'methodName2' };
    const endPoint3 = { ...endPoint, methodName: 'methodName3' };
    const discovery1 = createDiscovery({ address, seedAddress, endPoints: [endPoint1] });
    const discovery2 = createDiscovery({ address, seedAddress, endPoints: [endPoint2] });
    const discovery3 = createDiscovery({ address, seedAddress, endPoints: [endPoint3] });
    return {
      seedAddress,
      endPoint1,
      endPoint2,
      endPoint3,
      discovery1,
      discovery2,
      discovery3,
    }
  }

  it('Every node with the same seed address joins the same cluster', () => {
    expect.assertions(3);
    const { seedAddress } = createDiscoveriesWithSameSeedAddress();
    expect(Object.keys(window.scalecube.clusters)).toEqual([seedAddress]);
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(3);
  });

  it('Each node from the cluster includes all the endpoints from other nodes of the cluster except its own', () => {
    expect.assertions(9);
    const { seedAddress, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress();
    window.scalecube.clusters[seedAddress].nodes.forEach((node, index) => {
      expect(Object.keys(node)).toHaveLength(3);
      expect(node.address).toBe(address);
      switch(index) {
        case 0: {
          expect(node.endPoints).toEqual([endPoint2, endPoint3])
          break
        }
        case 1: {
          expect(node.endPoints).toEqual([endPoint1, endPoint3])
          break
        }
        case 2: {
          expect(node.endPoints).toEqual([endPoint1, endPoint2])
        }
        default: {
          break;
        }
      }
    })
  });

  it('AllEndPoints includes all the endpoints for each node in the cluster', () => {
    expect.assertions(1);
    const { seedAddress, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress();
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toEqual([endPoint1, endPoint2, endPoint3])
  });
});
