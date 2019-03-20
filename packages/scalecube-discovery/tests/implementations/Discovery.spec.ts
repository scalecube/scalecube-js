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
    methodName: 'methodName',
    asyncModel: 'ASYNC_MODEL_TYPES.REQUEST_RESPONSE',
    address: '',
  };

  const seedAddress = 'global';

  // node - discovery node

  // 1. Every node with the same seed address join the same cluster
  // 2. Nodes with different seed address join different cluster
  // 3. Different clusters are decoupled from each other
  // 4. Every node that joins the cluster notifies other nodes
  // 5. Discovery.destroy will remove remove itself from the cluster, notify other nodes and complete the notifier

  it('Create Cluster of multiple nodes', (done) => {
    expect.assertions(4);
    const endPoint1 = { ...endPoint, address: 'cluster1' };
    const endPoint2 = { ...endPoint, address: 'cluster2' };
    const endPoint3 = { ...endPoint, address: 'cluster3' };
    const discovery1 = createDiscovery({ address: 'cluster1', seedAddress, endPoints: [endPoint1] });
    const discovery2 = createDiscovery({ address: 'cluster2', seedAddress, endPoints: [endPoint2] });
    const discovery3 = createDiscovery({ address: 'cluster3', seedAddress, endPoints: [endPoint3] });
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(3);
    expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(3);

    discovery1.destroy().then(response => {
      expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(2);
      expect(window.scalecube.clusters[seedAddress].allEndPoints).toHaveLength(2);
      done();
    });
  });
});
