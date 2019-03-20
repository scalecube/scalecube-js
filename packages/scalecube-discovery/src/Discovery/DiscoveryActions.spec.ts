import { Observable, ReplaySubject } from 'rxjs';
import { Item, Node } from '../helpers/types';
import { addToCluster, getCluster, notifyAllListeners } from './DiscoveryActions';

describe('Test DiscoveryActions', () => {
  const seedAddress = 'mockAddress';

  beforeEach(() => {
    window.scalecube.clusters = {};
  });

  const createNode = (address = 'address'): Node => ({
    address,
    endPoints: [],
    subjectNotifier: new ReplaySubject<Item[]>(1),
  });

  it('Test getCluster({ seedAddress }): Cluster', () => {
    const cluster = getCluster({ seedAddress });
    expect(cluster).toMatchObject(window.scalecube.clusters[seedAddress]);
  });

  it('Test notifyAllListeners({ cluster }) - one node in the cluster', (done) => {
    const cluster = getCluster({ seedAddress });
    cluster.nodes = [createNode()];

    notifyAllListeners({ cluster });

    cluster.nodes[0].subjectNotifier.subscribe((endPoints) => {
      expect(endPoints).toHaveLength(0);
      done();
    });
  });

  it('Test notifyAllListeners({ cluster }) - multi nodes in the cluster', (done) => {
    expect.assertions(3);

    const cluster = getCluster({ seedAddress });
    cluster.nodes = [createNode('address1'), createNode('address2'), createNode('address3')];

    notifyAllListeners({ cluster });

    cluster.nodes.forEach((node) => {
      node.subjectNotifier.subscribe((endPoints) => {
        expect(endPoints).toHaveLength(0);
        if (node.address === 'address3') {
          done();
        }
      });
    });
  });

  it('Test addToCluster({ cluster, endPoints, address, subjectNotifier }): Cluster', () => {
    expect.assertions(3);
    const address = 'cluster';
    let cluster = getCluster({ seedAddress });
    cluster = addToCluster({ cluster, endPoints: [], address, subjectNotifier: new ReplaySubject(1) });
    expect(cluster.nodes).toHaveLength(1);
    const nodeInCluster = cluster.nodes[0];
    expect(nodeInCluster).toEqual(
      expect.objectContaining({
        address: expect.any(String),
        endPoints: expect.any(Array),
        subjectNotifier: expect.any(Observable),
      })
    );
    expect(nodeInCluster.address).toMatch(address);
  });
});
