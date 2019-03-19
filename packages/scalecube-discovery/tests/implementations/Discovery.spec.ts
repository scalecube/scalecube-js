import { createDiscovery } from "../../src/Discovery/Discovery";

describe('test', () => {
  beforeEach(() => {
    window.scalecube.discovery = {};
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

  it('Create Cluster of multiple nodes', (done) => {
    expect.assertions(4);
    const endPoint1 = { ...endPoint, address: 'cluster1' };
    const endPoint2 = { ...endPoint, address: 'cluster2' };
    const endPoint3 = { ...endPoint, address: 'cluster3' };
    const discovery1 = createDiscovery({ address: 'cluster1', seedAddress, endPoints: [endPoint1] });
    const discovery2 = createDiscovery({ address: 'cluster2', seedAddress, endPoints: [endPoint2] });
    const discovery3 = createDiscovery({ address: 'cluster3', seedAddress, endPoints: [endPoint3] });
    expect(window.scalecube.discovery[seedAddress].nodes).toHaveLength(3);
    expect(window.scalecube.discovery[seedAddress].allEndPoints).toHaveLength(3);

    discovery1.destroy().then(response => {
      expect(window.scalecube.discovery[seedAddress].nodes).toHaveLength(2);
      expect(window.scalecube.discovery[seedAddress].allEndPoints).toHaveLength(2);
      done();
    });
  });
});