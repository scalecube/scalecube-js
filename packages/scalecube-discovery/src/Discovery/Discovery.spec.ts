import { Observable } from 'rxjs';
import { ClustersMap } from '../helpers/types';
import { createDiscovery } from './Discovery';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const'

describe('Test Discovery', () => {
  beforeEach(() => {
    window.scalecube.clusters = {} as ClustersMap;
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

  it('Test createDiscovery add Nodes to cluster', () => {
    const seedAddress = 'myNamespace';
    expect(window.scalecube.clusters[seedAddress]).toBeUndefined();

    createDiscovery({ nodeAddress: 'node1', seedAddress, endPoints: [] });
    createDiscovery({ nodeAddress: 'node2', seedAddress, endPoints: [] });
    expect(window.scalecube.clusters[seedAddress].nodes).toHaveLength(2);
    expect(Object.keys(window.scalecube.clusters)).toHaveLength(1);
  });

  it('Test createDiscovery add Nodes to cluster by its seedAddress', () => {
    createDiscovery({ nodeAddress: 'node1', seedAddress: 'seedAddress1', endPoints: [] });
    createDiscovery({ nodeAddress: 'node2', seedAddress: 'seedAddress2', endPoints: [] });
    expect(Object.keys(window.scalecube.clusters)).toHaveLength(2);
  });

  it('Test createDiscovery expose methods', () => {
    const discovery = createDiscovery({ nodeAddress: 'node1', seedAddress: 'seedAddress1', endPoints: [] });
    expect(Object.keys(discovery)).toHaveLength(2);
    expect(discovery).toEqual(
      expect.objectContaining({
        destroy: expect.any(Function),
        notifier: expect.any(Observable),
      })
    );
  });

  it('Test subscribe to cluster', (done) => {
    expect.assertions(3);
    let step = 0;

    const discovery = createDiscovery({
      nodeAddress: 'node1',
      seedAddress: 'seedAddress1',
      endPoints: [endPoint, endPoint],
    });
    discovery.notifier.subscribe((endPoints) => {
      switch (step) {
        case 0:
          expect(endPoints).toHaveLength(0);
          step++;
          break;
        case 1:
          expect(endPoints).toHaveLength(1);
          step++;
          break;
      }
    });

    const discovery2 = createDiscovery({ nodeAddress: 'node2', seedAddress: 'seedAddress1', endPoints: [endPoint] });

    discovery2.notifier.subscribe((endPoints) => {
      expect(endPoints).toHaveLength(2);
      step++;
      if (step === 3) {
        done();
      }
    });
  });

  it('Test end node in cluster', (done) => {
    expect.assertions(3);
    let step = 0;
    const endpoint1 = { ...endPoint, address: 'node1' };
    const endpoint2 = { ...endPoint, address: 'node2' };
    const discovery = createDiscovery({
      nodeAddress: 'node1',
      seedAddress: 'seedAddress1',
      endPoints: [endpoint1, endpoint1],
    });
    const discovery2 = createDiscovery({ nodeAddress: 'node2', seedAddress: 'seedAddress1', endPoints: [endpoint2] });

    discovery.notifier.subscribe((endPoints) => {
      switch (step) {
        case 0:
          expect(endPoints).toHaveLength(1);
          break;
        case 1:
          expect(endPoints).toHaveLength(0);
          break;
      }
      step++;
    });

    discovery2.destroy().then((response: string) => {
      expect(response).toMatch(getDiscoverySuccessfullyDestroyedMessage('node2', 'seedAddress1'));
      if (step === 2) {
        done();
      }
    });
  });
});
