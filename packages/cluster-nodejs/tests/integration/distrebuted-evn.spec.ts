import { joinCluster } from '../../src';
import { getFullAddress } from '@scalecube/utils';
import { Address, ClusterApi } from '@scalecube/api';
import { ClusterEvent } from '@scalecube/api/src/cluster';

describe(`
    Background: 
        Given  cluster   | address   | seedAddress | itemsToPublish 
               'member0' | 'member0' |             | [s1, s2]
               'member1' | 'member1' | 'member0'   | [s1, s2]
               'member2' | 'member2' | 'member1'   | [s1, c2] 
               'member3' | 'member3' | 'member1'   | [s2, c1]
               
        And    'member0' subscribe to listen$
        And    all the clusters are connected
        
        | emitID | 	from	    | items	    | type
        | emit1	 | 'member1'	| [s1, s2]	| 'INIT'
        | emit2	 | 'member2'	| [s1, c2]	| 'ADDED'
        | emit3	 | 'member3'	| [s2, c1]	| 'ADDED'
        | emit4	 | 'member2'	| [s1, c2]	| 'REMOVED'
        | emit5	 | 'member1'	| [s1, s2]	| 'REMOVED'
        `, () => {
  const http = require('http');

  const buildCluster = (port: number, items: any[], seedAddress?: Address[]) => {
    const server = http.createServer().listen(port);
    const address = {
      protocol: 'ws',
      host: '127.0.0.1',
      port,
      path: '',
    };

    const member = joinCluster({
      address,
      seedAddress,
      itemsToPublish: items,
      // debug: true
    });

    const fullAddress = getFullAddress(address);
    return [address, member, fullAddress, items, server];
  };

  const [member0Address, member0, member0FullAddress, items0, s8000] = buildCluster(8000, ['s1', 's2']);
  const [member1Address, member1, member1FullAddress, items1, s8001] = buildCluster(8001, ['s1', 's2'], [
    member0Address,
  ] as Address[]);
  const [member2Address, member2, member2FullAddress, items2, s8002] = buildCluster(8002, ['s1', 'c2'], [
    member1Address,
  ] as Address[]);
  const [member3Address, member3, member3FullAddress, items3, s8003] = buildCluster(8003, ['s2', 'c1'], [
    member1Address,
  ] as Address[]);

  afterAll((done) => {
    (member0 as ClusterApi.Cluster).destroy();
    (member1 as ClusterApi.Cluster).destroy();
    (member2 as ClusterApi.Cluster).destroy();
    (member3 as ClusterApi.Cluster).destroy();

    s8000.close();
    s8002.close();
    s8003.close();
    s8001.close(done);
  });

  test(`And 'member0' listen$ will emit 'emit1', 'emit2', 'emit3'`, (done) => {
    expect.assertions(3);

    const emitsMap: { [key: string]: any } = {
      [member1FullAddress]: items1,
      [member2FullAddress]: items2,
      [member3FullAddress]: items3,
    };

    (member0 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'ADDED') {
        if (emitsMap[from]) {
          expect(emitsMap[from]).toEqual(expect.arrayContaining(items));
          delete emitsMap[from];
        }

        if (Object.keys(emitsMap).length === 0) {
          done();
        }
      }
    });
  });

  test(`Given  'member3' subscribe to listen$
        And    'member1' subscribe to listen$
        When  'member2' is destroyed
        Then   'member1' listen$ will emit 'emit4'
        And   'member3' listen$ will emit 'emit4'
        And   'member0' listen$ will emit 'emit4'
  `, (done) => {
    expect.assertions(6);

    const emitsMap = {
      [member0FullAddress.toString()]: items0,
      [member1FullAddress.toString()]: items1,
      [member3FullAddress.toString()]: items3,
    };

    const handleDone = (subscription: any) => {
      subscription && subscription.unsubscribe();
      if (Object.keys(emitsMap).length === 0) {
        done();
      }
    };

    const subscription0 = (member0 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'REMOVED') {
        expect(items).toEqual(expect.arrayContaining(items2 as []));
        expect(from).toMatch(member2FullAddress.toString());
        delete emitsMap[member0FullAddress.toString()];
        handleDone(subscription0);
      }
    });
    const subscription1 = (member1 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'REMOVED') {
        expect(items).toEqual(expect.arrayContaining(items2 as []));
        expect(from).toMatch(member2FullAddress.toString());
        delete emitsMap[member1FullAddress.toString()];
        handleDone(subscription1);
      }
    });
    const subscription3 = (member3 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'REMOVED') {
        expect(items).toEqual(expect.arrayContaining(items2 as []));
        expect(from).toMatch(member2FullAddress.toString());
        delete emitsMap[member3FullAddress.toString()];
        handleDone(subscription3);
      }
    });

    (member2 as ClusterApi.Cluster).destroy();
  });

  test(`
        Given  'member2' is destroyed
        And     'member3' subscribe to listen$
        When  'member1' is destroyed
        Then    'member3' listen$ will emit 'emit5'
         And    'member0' listen$ will emit 'emit5'
  `, (done) => {
    expect.assertions(4);

    const emitsMap = {
      [member0FullAddress.toString()]: items0,
      [member3FullAddress.toString()]: items3,
    };

    const handleDone = (subscription: any) => {
      subscription && subscription.unsubscribe();

      if (Object.keys(emitsMap).length === 0) {
        done();
      }
    };

    const subscription0 = (member0 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'REMOVED' && from === member1FullAddress) {
        delete emitsMap[member0FullAddress.toString()];
        expect(items).toEqual(expect.arrayContaining(items1 as []));
        expect(from).toMatch(member1FullAddress.toString());
        handleDone(subscription0);
      }
    });

    const subscription3 = (member3 as ClusterApi.Cluster).listen$().subscribe(({ type, items, from }: ClusterEvent) => {
      if (type === 'REMOVED' && from === member1FullAddress) {
        delete emitsMap[member3FullAddress.toString()];
        expect(items).toEqual(expect.arrayContaining(items1 as []));
        expect(from).toMatch(member1FullAddress.toString());
        handleDone(subscription3);
      }
    });

    (member1 as ClusterApi.Cluster).destroy();
  });
});
