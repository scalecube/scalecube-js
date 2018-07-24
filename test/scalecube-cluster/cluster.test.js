import { LogicalCluster as Cluster } from 'src/scalecube-cluster/LogicalCluster/LogicalCluster';
import { from } from 'rxjs/observable/from';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';

describe('Cluster suite', () => {
  const createClusters = () => {

    const clusterA = new Cluster();
    const clusterB = new Cluster();
    const clusterC = new Cluster();

    clusterA.metadata('clusterA');
    clusterB.metadata('clusterB');
    clusterC.metadata('clusterC');

    return {clusterA, clusterB, clusterC};
  };

  it('When clusterA join clusterB and B join C all cluster should be on all clusters', () => {
    const {clusterA, clusterB, clusterC} = createClusters();

    clusterA.join(clusterB);
    clusterB.join(clusterC);

    expect(clusterA.members().map(i=>i.metadata())).toEqual([ 'clusterA', 'clusterB', 'clusterC' ]);
    expect(clusterB.members().map(i=>i.metadata())).toEqual([ 'clusterB', 'clusterA', 'clusterC' ]);
    expect(clusterC.members().map(i=>i.metadata())).toEqual([ 'clusterC', 'clusterB', 'clusterA' ]);
  });
  it('When clusterA shutdown clusterB and C should not have clusterA and remove message should be send', () => {
    const {clusterA, clusterB, clusterC} = createClusters();
    expect.assertions(8);


    clusterA.join(clusterB);
    clusterB.join(clusterC);

      [clusterA,clusterB,clusterC].forEach(cluster =>
          cluster
              .listenMembership()
              .do((msg) => {
                  expect(msg.metadata).toEqual({});
                  expect(msg.type).toBe('remove');
              })
              .subscribe()
      );

    clusterA.shutdown();

     expect(clusterB.members().map(i=>i.metadata())).toEqual([ clusterB, clusterC ].map(i=>i.metadata()));
     expect(clusterC.members().map(i=>i.metadata())).toEqual([ clusterC, clusterB ].map(i=>i.metadata()));
  });
  it('When A join B and B join C all add essages are sent', (done) => {
    const {clusterA, clusterB, clusterC} = createClusters();

    expect.assertions(18);

    const eventFromCluster = 0;
    const expectValue = 1;

    const checkMeessage = (message$AndExpect$) => {
        expect(message$AndExpect$[eventFromCluster].metadata).toEqual(message$AndExpect$[expectValue].data);
        expect(message$AndExpect$[eventFromCluster].sender).toEqual(message$AndExpect$[expectValue].sender);
        expect(message$AndExpect$[eventFromCluster].type).toEqual('add');
    };

    clusterA
      .listenMembership()
      // zip with expectations
      .zip(from([
          {data: "clusterB", sender: clusterB.id()},
          {data: "clusterC", sender: clusterC.id()}
          ]))
      .do(checkMeessage)
      .subscribe();

    clusterB
      .listenMembership()
      .zip(from([
          {data: "clusterA", sender: clusterA.id()},
          {data: "clusterC", sender: clusterC.id()}
          ]))
        .do(checkMeessage)
      .subscribe();

    clusterC
      .listenMembership()
      .zip(from([
          {data: "clusterB", sender: clusterB.id()},
          {data: "clusterA", sender: clusterA.id()}
          ]))
        .do(checkMeessage)
      .elementAt(1)
      .do(()=>done())
      .subscribe();

    clusterA.join(clusterB);
    clusterB.join(clusterC);

  });
  it('Metadata should change and messages should be sent', (done) => {
    const {clusterA, clusterB, clusterC} = createClusters();
    expect.assertions(7);

    clusterA.join(clusterB);
    clusterB.join(clusterC);

    [clusterA,clusterB,clusterC].forEach(cluster =>
        cluster
          .listenMembership()
          .do((msg) => {
            expect(msg.metadata).toBe('Hello');
            expect(msg.type).toBe('change');
          })
          .elementAt(0)
          .do(()=>done())
          .subscribe()
        );
    clusterA.metadata('Hello');
    expect(clusterA.metadata()).toBe('Hello');
  });

});
