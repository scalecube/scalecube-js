// @flow
import { LogicalCluster as Cluster } from 'src/scalecube-services/cluster/LogicalCluster';
import { from } from 'rxjs/observable/from';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';


describe('Cluster suite', () => {
  const createClusters = () => {

    const clusterA = new Cluster();
    const clusterB = new Cluster();
    const clusterC = new Cluster();

    return {clusterA, clusterB, clusterC};
  };

  it('When clusterA join clusterB and B join C all cluster should be on all clusters', () => {
    const {clusterA, clusterB, clusterC} = createClusters();

    clusterA.join(clusterB);
    clusterB.join(clusterC);

    expect(clusterA.members()).toEqual([ clusterA, clusterB, clusterC ]);
    expect(clusterB.members()).toEqual([ clusterB, clusterA, clusterC ]);
    expect(clusterC.members()).toEqual([ clusterC, clusterB, clusterA ]);
  });
  it('When clusterA shutdown clusterB and C should not have clusterA', () => {
    const {clusterA, clusterB, clusterC} = createClusters();

    clusterA.join(clusterB);
    clusterB.join(clusterC);
    clusterA.shutdown();

    //expect(clusterA).toBe(undefined);
    expect(clusterB.members()).toEqual([ clusterB, {}, clusterC ]);
    expect(clusterC.members()).toEqual([ clusterC, clusterB, {} ]);
  });
  it('Message', (done) => {
    const {clusterA, clusterB, clusterC} = createClusters();
    clusterA.metadata('clusterA');
    clusterB.metadata('clusterB');
    clusterC.metadata('clusterC');

    clusterA
      .listenMembership()
      .zip(from([ "clusterA", "clusterB", "clusterC" ]))
      .do((a) => {
        //expect(a[ 0 ].data.myMetadata).toBe(a[ 1 ]);
        console.log(a[ 0 ].data.myMetadata);
      })
      .subscribe();

    clusterA.join(clusterB);
    clusterB.join(clusterC);
    clusterA.shutdown();

  });
});
