import {LocalCluster} from '../src/LogicalCluster/LocalCluster';
import {RemoteCluster} from '../src/LogicalCluster/RemoteCluster';
import {fork} from 'child_process';
import 'rxjs/add/operator/zip';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/elementAt';
import Worker from 'tiny-worker';
import EventEmitter from 'events';

// TODO messages order isn't important
// tests can be changed to have message in different order
// this was easier to implemented

const listeningMembersSubscriptions = [];

const testListenMembership = (cluster, messages) => {
  let index = 0;
  const subscription = cluster.listenMembership()
    .subscribe((message) => {
      messages.forEach((expectedMessage, messageIndex) => {
        if (index === messageIndex) {
          expect(message).toEqual(expectedMessage);
        }
      });
      index++;
    });
  listeningMembersSubscriptions.push(subscription);
};

describe('Cluster suite', () => {
  global.mainEventEmitter = new EventEmitter();
  mainEventEmitter.setMaxListeners(Number.MAX_SAFE_INTEGER);
  const createClusters = async () => {

    global.main = new Worker(() => {
      self.onmessage = (e) => self.postMessage(e.data);
    });

    main.addEventListener('message', (event) => {
      mainEventEmitter.emit(event.data.eventType, event);
    });

    const localClusterA = new LocalCluster();
    const localClusterB = new LocalCluster();
    const localClusterC = new LocalCluster();

    const registerCB = cb => mainEventEmitter.on('requestResponse', e => cb(e.data));

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

  afterEach(() => {
    listeningMembersSubscriptions.forEach(subscription => subscription.unsubscribe());
    listeningMembersSubscriptions.length = 0;
    main.terminate();
  });

  afterAll(() => {
    mainEventEmitter.removeAllListeners('requestResponse');
    mainEventEmitter.removeAllListeners('messageToChanel');
  });

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
    expect.assertions(5);

    await clusterA.join(clusterB);
    const clusterAId = await clusterA.id();
    await clusterB.join(clusterC);

    [clusterA, clusterB, clusterC].forEach(cluster => testListenMembership(
      cluster,
      [{ type: 'remove', metadata: {}, memberId: clusterAId, senderId: clusterAId }]
    ));

    await clusterA.shutdown();

    const bMembers = await clusterB.members();
    const cMembers = await clusterC.members();
    expect(bMembers.map(i => i.metadata)).toEqual(['clusterB', 'clusterC']);
    expect(cMembers.map(i => i.metadata)).toEqual(['clusterC', 'clusterB']);

    setTimeout(() => {
      done();
    }, 2000);
  });

  it('When A join B and B join C all add messages are sent', async () => {
    const { clusterA, clusterB, clusterC } = await createClusters();
    const clusterAId = await clusterA.id();
    const clusterBId = await clusterB.id();
    const clusterCId = await clusterC.id();

    expect.assertions(3 * 2); // clusters * messages

    testListenMembership(
      clusterA,
      [
        { metadata: 'clusterB', senderId: clusterBId, memberId: clusterBId, type: 'add' },
        { metadata: 'clusterC', senderId: clusterCId, memberId: clusterCId, type: 'add' }
      ]
    );

    testListenMembership(
      clusterB,
      [
        { metadata: 'clusterA', senderId: clusterAId, memberId: clusterAId, type: 'add' },
        { metadata: 'clusterC', senderId: clusterCId, memberId: clusterCId, type: 'add' }
      ]
    );

    testListenMembership(
      clusterC,
      [
        { metadata: 'clusterA', senderId: clusterAId, memberId: clusterAId, type: 'add' },
        { metadata: 'clusterB', senderId: clusterBId, memberId: clusterBId, type: 'add' }
      ]
    );

    await clusterA.join(clusterB);
    await clusterB.join(clusterC);
  });

  it('Metadata should change and messages should be sent', async () => {
    const {clusterA, clusterB, clusterC} = await createClusters();
    const clusterAId = await clusterA.id();
    expect.assertions(4); // 1 message X 3 clusters + clusterA.metadata()

    await clusterA.join(clusterB);
    await clusterB.join(clusterC);

    [clusterA, clusterB, clusterC].forEach(cluster => testListenMembership(
      cluster,
      [{ type: 'change', metadata: 'Hello', memberId: clusterAId, senderId: clusterAId }]
    ));

    await clusterA.metadata('Hello');
    const clusterAMetadata = await clusterA.metadata();
    expect(clusterAMetadata).toBe('Hello');
  });

});
