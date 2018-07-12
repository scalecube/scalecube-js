// @flow
import { LogicalCluster as Cluster } from 'src/scalecube-cluster/LogicalCluster';
import { from } from 'rxjs/observable/from';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';

describe('Cluster suite', () => {
  const createClusters = () => {

    const clusterA = new Cluster();
    const clusterB = new Cluster();
    const clusterC = new Cluster();



    return {clusterA, clusterB, clusterC};
  };

  it('When clusterA join clusterB and B join C all scalecube-scalecube-cluster should be on all clusters', () => {
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
    expect(clusterB.members()).toEqual([ clusterB, clusterC ]);
    expect(clusterC.members()).toEqual([ clusterC, clusterB ]);
  });
  it('Messages are sent', (done) => {
    const {clusterA, clusterB, clusterC} = createClusters();

    expect.assertions(12);

    clusterA.metadata('clusterA');
    clusterB.metadata('clusterB');
    clusterC.metadata('clusterC');

    clusterA
      .listenMembership()
      .zip(from([ {data: "clusterB", sender: clusterB.address()}, {data: "clusterC", sender: clusterC.address()} ]))
      .do((a) => {
        expect(a[ 0 ].metadata).toEqual(a[ 1 ].data);
        expect(a[ 0 ].sender).toEqual(a[ 1 ].sender);
      })
      .subscribe();

    clusterB
      .listenMembership()
      .zip(from([ {data: "clusterA", sender: clusterA.address()}, {data: "clusterC", sender: clusterC.address()} ]))
      .do((a) => {
        expect(a[ 0 ].metadata).toEqual(a[ 1 ].data);
        expect(a[ 0 ].sender).toEqual(a[ 1 ].sender);
      })
      .subscribe();


    clusterC
      .listenMembership()
      .zip(from([ {data: "clusterB", sender: clusterB.address()}, {data: "clusterA", sender: clusterA.address()} ]))
      .do((a) => {
        expect(a[ 0 ].metadata).toEqual(a[ 1 ].data);
        expect(a[ 0 ].sender).toEqual(a[ 1 ].sender);
      })
      .elementAt(1)
      .do(()=>done())
      .subscribe();

    clusterA.join(clusterB);
    clusterB.join(clusterC);
    clusterA.shutdown();

  });
  it('Metadata should change', (done) => {
    const {clusterA, clusterB, clusterC} = createClusters();
    expect.assertions(2);

    clusterA.join(clusterB);
    clusterB.join(clusterC);

    clusterC
      .listenMembership()
      .do((msg) => {
        expect(msg.metadata).toBe('Hello')
      })
      .elementAt(0)
      .do(()=>done())
      .subscribe();

    clusterA.metadata('Hello');
    expect(clusterA.metadata()).toBe('Hello');
  });

});
