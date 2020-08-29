import { JoinCluster } from '../index';
import { getAddress } from '@scalecube/utils';

export function clusterSpec(joinCluster: JoinCluster) {
  describe('Cluster API suite', () => {
    function createABC(perfix: string) {
      const clusterA = joinCluster({
        address: getAddress(perfix + 'A'),
        itemsToPublish: ['A'],
        seedAddress: [getAddress(perfix + 'B')],
      });

      const clusterB = joinCluster({
        address: getAddress(perfix + 'B'),
        itemsToPublish: ['B'],
        seedAddress: [getAddress(perfix + 'C')],
      });

      const clusterC = joinCluster({
        itemsToPublish: ['C'],
        address: getAddress(perfix + 'C'),
      });
      return { clusterA, clusterB, clusterC };
    }
    function createABC2(perfix: string) {
      const clusterA = joinCluster({
        address: getAddress(perfix + 'A'),
        itemsToPublish: ['A'],
        seedAddress: [getAddress(perfix + 'C')],
      });

      const clusterB = joinCluster({
        address: getAddress(perfix + 'B'),
        itemsToPublish: ['B'],
        seedAddress: [getAddress(perfix + 'C')],
      });

      const clusterC = joinCluster({
        itemsToPublish: ['C'],
        address: getAddress(perfix + 'C'),
      });
      return { clusterA, clusterB, clusterC };
    }

    it('When ClusterA and ClusterB join C all Cluster should be on all clusters', (done) => {
      const { clusterA, clusterB, clusterC } = createABC2('t0-');

      setTimeout(async () => {
        const a = await clusterA.getCurrentMembersData();
        const b = await clusterB.getCurrentMembersData();
        const c = await clusterC.getCurrentMembersData();
        expect(a).toEqual({
          'pm://defaultHost:8080/t0-A': ['A'],
          'pm://defaultHost:8080/t0-B': ['B'],
          'pm://defaultHost:8080/t0-C': ['C'],
        });
        expect(b).toEqual({
          'pm://defaultHost:8080/t0-A': ['A'],
          'pm://defaultHost:8080/t0-B': ['B'],
          'pm://defaultHost:8080/t0-C': ['C'],
        });
        expect(c).toEqual({
          'pm://defaultHost:8080/t0-A': ['A'],
          'pm://defaultHost:8080/t0-B': ['B'],
          'pm://defaultHost:8080/t0-C': ['C'],
        });

        done();
      }, 100);
    });
    it('When clusterA join clusterB and B join C all cluster should be on all clusters', (done) => {
      const { clusterA, clusterB, clusterC } = createABC('t1-');

      setTimeout(async () => {
        const a = await clusterA.getCurrentMembersData();
        const b = await clusterB.getCurrentMembersData();
        const c = await clusterC.getCurrentMembersData();
        expect(a).toEqual({
          'pm://defaultHost:8080/t1-A': ['A'],
          'pm://defaultHost:8080/t1-B': ['B'],
          'pm://defaultHost:8080/t1-C': ['C'],
        });
        expect(b).toEqual({
          'pm://defaultHost:8080/t1-A': ['A'],
          'pm://defaultHost:8080/t1-B': ['B'],
          'pm://defaultHost:8080/t1-C': ['C'],
        });
        expect(c).toEqual({
          'pm://defaultHost:8080/t1-A': ['A'],
          'pm://defaultHost:8080/t1-B': ['B'],
          'pm://defaultHost:8080/t1-C': ['C'],
        });

        done();
      }, 100);
    });
    it('When clusterA shutdown clusterB and C should not have clusterA and remove message should be send', (done) => {
      const { clusterA, clusterB, clusterC } = createABC('t2-');

      setTimeout(async () => {
        await clusterB.destroy();
        const a = await clusterA.getCurrentMembersData();
        const c = await clusterC.getCurrentMembersData();
        expect(a).toEqual({
          'pm://defaultHost:8080/t2-A': ['A'],
          'pm://defaultHost:8080/t2-C': ['C'],
        });
        expect(c).toEqual({
          'pm://defaultHost:8080/t2-A': ['A'],
          'pm://defaultHost:8080/t2-C': ['C'],
        });

        done();
      }, 1000);
    });
    it('When A join B and B join C all "init", "add", "remove" messages are sent', (done) => {
      const { clusterA, clusterB, clusterC } = createABC('t3-');

      const loga: any[] = [];
      const logb: any[] = [];
      const logc: any[] = [];

      clusterA.listen$().subscribe((i) => {
        loga.push({ ...i });
      });
      clusterB.listen$().subscribe((i) => {
        logb.push({ ...i });
      });
      clusterC.listen$().subscribe((i) => {
        logc.push({ ...i });
      });

      setTimeout(async () => {
        expect(loga).toContainEqual({ from: 'pm://defaultHost:8080/t3-B', items: ['B'], type: 'ADDED' });
        expect(loga).toContainEqual({ from: 'pm://defaultHost:8080/t3-C', items: ['C'], type: 'ADDED' });

        expect(logb).toContainEqual({ from: 'pm://defaultHost:8080/t3-A', items: ['A'], type: 'INIT' });
        expect(logb).toContainEqual({ from: 'pm://defaultHost:8080/t3-C', items: ['C'], type: 'ADDED' });

        expect(logc).toContainEqual({ from: 'pm://defaultHost:8080/t3-B', items: ['B'], type: 'INIT' });
        expect(logc).toContainEqual({ from: 'pm://defaultHost:8080/t3-A', items: ['A'], type: 'ADDED' });

        await Promise.all([clusterA.destroy(), clusterB.destroy(), clusterC.destroy()]);

        expect(loga.length).toBe(5);
        expect(logb.length).toBe(5);
        expect(logc.length).toBe(5);

        expect(loga).toContainEqual({ from: 'pm://defaultHost:8080/t3-A', items: ['A'], type: 'REMOVED' });
        expect(loga).toContainEqual({ from: 'pm://defaultHost:8080/t3-B', items: ['B'], type: 'REMOVED' });
        expect(loga).toContainEqual({ from: 'pm://defaultHost:8080/t3-C', items: ['C'], type: 'REMOVED' });

        expect(logb).toContainEqual({ from: 'pm://defaultHost:8080/t3-A', items: ['A'], type: 'REMOVED' });
        expect(logb).toContainEqual({ from: 'pm://defaultHost:8080/t3-B', items: ['B'], type: 'REMOVED' });
        expect(logb).toContainEqual({ from: 'pm://defaultHost:8080/t3-C', items: ['C'], type: 'REMOVED' });

        expect(logc).toContainEqual({ from: 'pm://defaultHost:8080/t3-A', items: ['A'], type: 'REMOVED' });
        expect(logc).toContainEqual({ from: 'pm://defaultHost:8080/t3-B', items: ['B'], type: 'REMOVED' });
        expect(logc).toContainEqual({ from: 'pm://defaultHost:8080/t3-C', items: ['C'], type: 'REMOVED' });

        done();
      }, 100);
    });
  });
}

/*
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
    it('When A join B and B join C all add messages are sent', () => {
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
});

 */
