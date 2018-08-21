import { LocalCluster  } from '../src/LogicalCluster/LocalCluster';
import { RemoteCluster } from '../src/LogicalCluster/RemoteCluster';
import { Transport } from '../src/LogicalCluster/Transport';
import { fork } from 'child_process';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';
import Worker from 'tiny-worker';

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
  const createClusters = async () => {

    const localClusterA = new LocalCluster();
    const localClusterB = new LocalCluster();
    const localClusterC = new LocalCluster();

    const main = new Worker(()=>{
      self.onmessage = (e) => self.postMessage(e.data);
    });

    // const registerCB = (cb) => main.addEventListener("message", (e)=>cb(e.data), false);
    //
    // localClusterA.eventBus(registerCB);
    // localClusterB.eventBus(registerCB);
    // localClusterC.eventBus(registerCB);

    const clusterA = new RemoteCluster();
    const clusterB = new RemoteCluster();
    const clusterC = new RemoteCluster();


    clusterA.transport({
      type: "PostMessage",
      worker: main,
      me: main,
    });
    clusterB.transport({
      type: "PostMessage",
      worker: main,
      me: main,
    });
    clusterC.transport({
        type: "PostMessage",
        worker: main,
        me: main,
    });

    await clusterA.metadata('clusterA');
    await clusterB.metadata('clusterB');
    await clusterC.metadata('clusterC');

    return {clusterA, clusterB, clusterC};
  };

  it('When clusterA join clusterB and B join C all cluster should be on all clusters', async (done) => {
    const {clusterA, clusterB, clusterC} = await createClusters();

    clusterA.join(clusterB).then((test) => {
      console.log('test', test);
      done();
    });



    // clusterB.join(clusterC);
    //
    // expect(clusterA.members().map(i=>i.metadata())).toEqual([ 'clusterA', 'clusterB', 'clusterC' ]);
    // expect(clusterB.members().map(i=>i.metadata())).toEqual([ 'clusterB', 'clusterA', 'clusterC' ]);
    // expect(clusterC.members().map(i=>i.metadata())).toEqual([ 'clusterC', 'clusterB', 'clusterA' ]);
  });
  it('When clusterA shutdown clusterB and C should not have clusterA and remove message should be send', async () => {
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

    const bMembers = await clusterB.members();
    const cMembers = await clusterC.members();
     expect(bMembers.map(i=>i.metadata())).toEqual([ clusterB, clusterC ].map(i=>i.metadata()));
     expect(cMembers.map(i=>i.metadata())).toEqual([ clusterC, clusterB ].map(i=>i.metadata()));
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

  it('Test', (done) => {
    const transport = new Transport();
    transport.addProcess({ id: 'processA', path: './packages/scalecube-cluster/tests/processA.js' });

    setTimeout(() => {
      done();
    }, 7000);
  }, 7500);

});
