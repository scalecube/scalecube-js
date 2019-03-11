import { addToCluster, getSeed, notifyAllListeners } from './DiscoveryActions';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';
import { Observable, ReplaySubject } from 'rxjs';

describe('Test DiscoveryActions', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    window.scalecube.discovery = {};
  });

  const createNode = (address = 'address') => ({
    address,
    endPoints: [],
    subjectNotifier: new ReplaySubject<Endpoint[]>(1),
  });

  it('Test getSeed({ seedAddress }): Seed', () => {
    const seed = getSeed({ seedAddress: 'mockAddress' });
    // @ts-ignore
    expect(seed).toMatchObject(window.scalecube.discovery['mockAddress']);
  });

  it('Test notifyAllListeners({seed}) - one node in the cluster', (done) => {
    const seed = getSeed({ seedAddress: 'mockAddress' });
    seed.cluster = [createNode()];

    notifyAllListeners({ seed });

    seed.cluster[0].subjectNotifier.subscribe((endPoints) => {
      expect(endPoints).toHaveLength(0);
      done();
    });
  });

  it('Test notifyAllListeners({seed}) - multi nodes in the cluster', (done) => {
    expect.assertions(3);

    const seed = getSeed({ seedAddress: 'mockAddress' });
    seed.cluster = [createNode('address1'), createNode('address2'), createNode('address3')];

    notifyAllListeners({ seed });

    seed.cluster.forEach((node) => {
      node.subjectNotifier.subscribe((endPoints) => {
        expect(endPoints).toHaveLength(0);
        if (node.address === 'address3') done();
      });
    });
  });

  it('Test addToCluster({ seed, endPoints, address, subjectNotifier }) : Seed', () => {
    expect.assertions(3);
    const address = 'cluster';
    let seed = getSeed({ seedAddress: 'mockAddress' });
    seed = addToCluster({ seed, endPoints: [], address, subjectNotifier: new ReplaySubject(1) });
    expect(seed.cluster).toHaveLength(1);
    const nodeInCluster = seed.cluster[0];
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
