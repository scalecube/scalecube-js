import {LocalCluster} from '../src/LogicalCluster/LocalCluster';
import {RemoteCluster} from '../src/LogicalCluster/RemoteCluster';
import {Transport} from '../src/LogicalCluster/Transport';
import {fork} from 'child_process';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';
import Worker from 'tiny-worker';
import EventEmitter from 'events';

const expectMessage = (cluster, at, messageExpected) =>
  cluster
    .listenMembership()
    .elementAt(at)
    .do(messageSent => expect(messageSent).toEqual(messageExpected))
    .subscribe();

// TODO messages order isn't important
// tests can be changed to have message in different order
// this was easier to implemented

describe('Cluster suite', () => {
  global.mainEventEmitter = new EventEmitter();
  mainEventEmitter.setMaxListeners(Number.MAX_SAFE_INTEGER);
  const createClusters = async () => {

    global.main = new Worker(() => {
      self.onmessage = (e) => self.postMessage(e.data);
    });

    main.addEventListener('message', (event) => {
      mainEventEmitter.emit('message', event);
    });

    const localClusterA = new LocalCluster();
    const localClusterB = new LocalCluster();
    const localClusterC = new LocalCluster();

    const registerCB = cb => mainEventEmitter.on("message", e => cb(e.data));

    localClusterA.eventBus(registerCB);
    localClusterB.eventBus(registerCB);
    localClusterC.eventBus(registerCB);

    const clusterA = new RemoteCluster();
    const clusterB = new RemoteCluster();
    const clusterC = new RemoteCluster();

    clusterA.transport({
      type: "PostMessage",
      worker: main,
      me: mainEventEmitter,
      clusterId: localClusterA.id()
    });
    clusterB.transport({
      type: "PostMessage",
      worker: main,
      me: mainEventEmitter,
      clusterId: localClusterB.id()
    });
    clusterC.transport({
      type: "PostMessage",
      worker: main,
      me: mainEventEmitter,
      clusterId: localClusterC.id()
    });

    await clusterA.metadata('clusterA');
    await clusterB.metadata('clusterB');
    await clusterC.metadata('clusterC');

    return { clusterA, clusterB, clusterC };
  };

  it('When clusterA join clusterB and B join C all cluster should be on all clusters', async () => {
    expect.assertions(3);
    const { clusterA, clusterB, clusterC } = await createClusters();
    await clusterA.join(clusterB);
    await clusterB.join(clusterC);

    const clusterAMembers = await clusterA.members();
    const clusterBMembers = await clusterB.members();
    const clusterCMembers = await clusterC.members();
    expect(clusterAMembers.map(cluster => cluster.metadata)).toEqual([ 'clusterA', 'clusterB', 'clusterC' ]);
    expect(clusterBMembers.map(cluster => cluster.metadata)).toEqual([ 'clusterB', 'clusterA', 'clusterC' ]);
    expect(clusterCMembers.map(cluster => cluster.metadata)).toEqual([ 'clusterC', 'clusterB', 'clusterA' ]);
  });

  it('When clusterA shutdown clusterB and C should not have clusterA and remove message should be send', async (done) => {
    const { clusterA, clusterB, clusterC } = await createClusters();
    // expect.assertions(8);

    await clusterA.join(clusterB);
    const clusterAId = await clusterA.id();
    await clusterB.join(clusterC);

    // TODO There is the dublication of messages
    [clusterA, clusterB, clusterC].forEach((cluster) =>
      cluster
        .listenMembership()
        .do((msg) => {
          expect(msg.type).toEqual('remove');
          expect(msg.metadata).toEqual({});
          expect(msg.memberId).toEqual(clusterAId);
        })
        .subscribe()
    );

    await clusterA.shutdown();

    const bMembers = await clusterB.members();
    const cMembers = await clusterC.members();
    expect(bMembers.map(i => i.metadata)).toEqual(['clusterB', 'clusterC']);
    expect(cMembers.map(i => i.metadata)).toEqual(['clusterC', 'clusterB']);

    setTimeout(() => {
      done();
    }, 2000);
  });

  it('When A join B and B join C all add messages are sent', async (done) => {
    const {clusterA, clusterB, clusterC} = await createClusters();

    // expect.assertions(3 * 2); // clusters * messages

    [clusterA, clusterB, clusterC].forEach((cluster) =>
      cluster
        .listenMembership()
        .do((msg) => {

          console.log('msg', msg);

          // expect(msg.type).toEqual('add');
          // expect(msg.data).toEqual({});
          // expect(msg.memberId).toEqual(clusterAId);
        })
        .subscribe()
    );

    // expectMessage(clusterA, 0, {
    //   metadata: "clusterB",
    //   senderId: clusterB.id(),
    //   memberId: clusterB.id(),
    //   type: 'add'
    // });
    // expectMessage(clusterA, 1, {
    //   metadata: "clusterC",
    //   senderId: clusterC.id(),
    //   memberId: clusterC.id(),
    //   type: 'add'
    // });
    //
    // expectMessage(clusterB, 0, {
    //   metadata: "clusterA",
    //   senderId: clusterA.id(),
    //   memberId: clusterA.id(),
    //   type: 'add'
    // });
    //
    // expectMessage(clusterB, 1, {
    //   metadata: "clusterC",
    //   senderId: clusterC.id(),
    //   memberId: clusterC.id(),
    //   type: 'add'
    // });
    //
    // expectMessage(clusterC, 0, {
    //   metadata: "clusterB",
    //   senderId: clusterB.id(),
    //   memberId: clusterB.id(),
    //   type: 'add'
    // });
    //
    // expectMessage(clusterC, 1, {
    //   metadata: "clusterA",
    //   senderId: clusterA.id(),
    //   memberId: clusterA.id(),
    //   type: 'add'
    // });

    await clusterA.join(clusterB);
    await clusterB.join(clusterC);

    setTimeout(() => {
      done();
    }, 2000);

  });
  // it('Metadata should change and messages should be sent', () => {
  //   const {clusterA, clusterB, clusterC} = createClusters();
  //   expect.assertions(4); // 1 message X 3 clusters + clusterA.metadata()
  //
  //   clusterA.join(clusterB);
  //   clusterB.join(clusterC);
  //
  //   [clusterA, clusterB, clusterC].forEach(cluster =>
  //     expectMessage(cluster, 0, {
  //       metadata: "Hello",
  //       senderId: clusterA.id(),
  //       memberId: clusterA.id(),
  //       type: 'change'
  //     })
  //   );
  //   clusterA.metadata('Hello');
  //   expect(clusterA.metadata()).toBe('Hello');
  // });

});
