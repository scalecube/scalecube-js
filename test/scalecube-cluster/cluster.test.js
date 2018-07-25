import { LogicalCluster as Cluster } from 'src/scalecube-cluster/LogicalCluster/LogicalCluster';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';

const expectMessage = (cluster, at, messageExpected) =>
    cluster
        .listenMembership()
        .elementAt(at)
        .do(messageSent=>expect(messageSent).toEqual(messageExpected))
        .subscribe();

// TODO messages order isn't important
// tests can be changed to have message in different order
// this was easier to implemented

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
  it('When A join B and B join C all add essages are sent', () => {
    const {clusterA, clusterB, clusterC} = createClusters();

    expect.assertions(3 * 2); // clusters * messages

    expectMessage(clusterA, 0, {
        metadata: "clusterB",
        senderId: clusterB.id(),
        memberId: clusterB.id(),
        type: 'add'
    });
    expectMessage(clusterA, 1, {
        metadata: "clusterC",
        senderId: clusterC.id(),
        memberId: clusterC.id(),
        type: 'add'
    });

    expectMessage(clusterB, 0, {
      metadata: "clusterA",
      senderId: clusterA.id(),
      memberId: clusterA.id(),
      type: 'add'
    });

    expectMessage(clusterB, 1, {
      metadata: "clusterC",
      senderId: clusterC.id(),
      memberId: clusterC.id(),
      type: 'add'
    });

    expectMessage(clusterC, 0, {
      metadata: "clusterB",
      senderId: clusterB.id(),
      memberId: clusterB.id(),
      type: 'add'
    });

    expectMessage(clusterC, 1, {
      metadata: "clusterA",
      senderId: clusterA.id(),
      memberId: clusterA.id(),
      type: 'add'
    });

    clusterA.join(clusterB);
    clusterB.join(clusterC);

  });
  it('Metadata should change and messages should be sent', () => {
    const {clusterA, clusterB, clusterC} = createClusters();
    expect.assertions(4); // 1 message X 3 clusters + clusterA.metadata()

    clusterA.join(clusterB);
    clusterB.join(clusterC);

    [clusterA,clusterB,clusterC].forEach(cluster =>
        expectMessage(cluster, 0, {
            metadata: "Hello",
            senderId: clusterA.id(),
            memberId: clusterA.id(),
            type: 'change'
        })

  );
    clusterA.metadata('Hello');
    expect(clusterA.metadata()).toBe('Hello');
  });

});
