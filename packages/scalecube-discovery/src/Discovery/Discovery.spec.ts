import { ClustersMap } from '../helpers/types';
import { createDiscovery } from './Discovery';
import { getDiscoverySuccessfullyDestroyedMessage } from '../helpers/const'

describe('Test Discovery', () => {
  beforeEach(() => {
    window.scalecube.clusters = {} as ClustersMap;
  });

  const itemToPublish = {
    address: 'itemAddress',
  };

  it('Test createDiscovery add Nodes to cluster', () => {
    const seedAddress = 'myNamespace';
    expect(window.scalecube.clusters[seedAddress]).toBeUndefined();

    createDiscovery({ address: 'node1', seedAddress, itemsToPublish: [] });
    createDiscovery({ address: 'node2', seedAddress, itemsToPublish: [] });
    expect(window.scalecube.clusters[seedAddress].discoveries).toHaveLength(2);
    expect(Object.keys(window.scalecube.clusters)).toHaveLength(1);
  });

  it('Test createDiscovery add Nodes to cluster by its seedAddress', () => {
    createDiscovery({ address: 'node1', seedAddress: 'seedAddress1', itemsToPublish: [] });
    createDiscovery({ address: 'node2', seedAddress: 'seedAddress2', itemsToPublish: [] });
    expect(Object.keys(window.scalecube.clusters)).toHaveLength(2);
  });

  it('Test createDiscovery expose methods', () => {
    const discovery = createDiscovery({ address: 'node1', seedAddress: 'seedAddress1', itemsToPublish: [] });
    expect(Object.keys(discovery)).toHaveLength(2);
    expect(discovery).toEqual(
      expect.objectContaining({
        destroy: expect.any(Function),
        discoveredItems$: expect.any(Function),
      })
    );
  });

  it('Test subscribe to cluster', (done) => {
    expect.assertions(3);
    let step = 0;

    const discovery = createDiscovery({
      address: 'node1',
      seedAddress: 'seedAddress1',
      itemsToPublish: [itemToPublish, itemToPublish],
    });
    discovery.discoveredItems$().subscribe((discoveredItems) => {
      switch (step) {
        case 0:
          expect(discoveredItems).toHaveLength(0);
          step++;
          break;
        case 1:
          expect(discoveredItems).toHaveLength(1);
          step++;
          break;
      }
    });

    const discovery2 = createDiscovery({ address: 'node2', seedAddress: 'seedAddress1', itemsToPublish: [itemToPublish] });

    discovery2.discoveredItems$().subscribe((discoveredItems) => {
      expect(discoveredItems).toHaveLength(2);
      step++;
      if (step === 3) {
        done();
      }
    });
  });

  it('Test end node in cluster', (done) => {
    expect.assertions(3);
    let step = 0;
    const itemToPublish1 = { ...itemToPublish, address: 'node1' };
    const itemToPublish2 = { ...itemToPublish, address: 'node2' };
    const discovery = createDiscovery({
      address: 'node1',
      seedAddress: 'seedAddress1',
      itemsToPublish: [itemToPublish1, itemToPublish1],
    });
    const discovery2 = createDiscovery({ address: 'node2', seedAddress: 'seedAddress1', itemsToPublish: [itemToPublish2] });

    discovery.discoveredItems$().subscribe((discoveredItems) => {
      switch (step) {
        case 0:
          expect(discoveredItems).toHaveLength(1);
          break;
        case 1:
          expect(discoveredItems).toHaveLength(0);
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
