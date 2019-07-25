import { joinCluster } from '../../src';
import { getAddress, getFullAddress } from '@scalecube/utils';
import { ClusterEvent } from '@scalecube/api/src/cluster';
import { ClusterApi } from '@scalecube/api';

describe('cluster-positive-scenarios', () => {
  test(`  
      Scenario:   1 server and 1 client - server starts before the client
      Background:
                  Given  cluster with address: 'server' and itemsToPublish: ['s1', 's2']
                  And    cluster with address: 'client' ,  seedAddress: 'server' and itemsToPublish: ['s1', 'c2']
                  And    'server' starting before 'client'

                  | emitID |	from    |	items   |	type   |
                  | emit1	 | 'server'	| [s1,s2]	| 'INIT' |
                  | emit2	 | 'client'	| [s1,c2]	| 'INIT' |

                  When  'server' subscribes to listen$
                  Then  listen$ will emit 'emit2'

                  When  'client' subscribes to listen$
                  Then  listen$ will emit 'emit1'
                  `, (done) => {
    expect.assertions(2);

    let serverFlag = false;
    let clientFlag = false;

    const serverAddress = getAddress('server');
    const clientAddress = getAddress('client');
    const server = joinCluster({
      address: serverAddress,
      itemsToPublish: ['s1', 's2'],
    });

    const client = joinCluster({
      address: clientAddress,
      seedAddress: serverAddress,
      itemsToPublish: ['s1', 'c2'],
    });

    const isDone = async () => {
      if (clientFlag && serverFlag) {
        await server.destroy();
        await client.destroy();
        done();
        // @ts-ignore
        return Promise.resolve();
      }
    };

    const serverSubscription = server.listen$().subscribe((res: ClusterEvent) => {
      expect(res).toMatchObject({
        from: getFullAddress(clientAddress),
        items: ['s1', 'c2'],
        type: 'INIT',
      });
      serverFlag = true;
      serverSubscription.unsubscribe();
      isDone();
    });

    const clientSubscription = client.listen$().subscribe((res: ClusterEvent) => {
      expect(res).toMatchObject({
        from: getFullAddress(serverAddress),
        items: ['s1', 's2'],
        type: 'INIT',
      });
      clientFlag = true;
      clientSubscription.unsubscribe();
      isDone();
    });
  });
  test(`
     Scenario:    Client do few retries until it finds a server
     Background:
          Given   cluster with address: 'server' and itemsToPublish: ['s1', 's2']
          And     cluster with address: 'client' , seedAddress: 'server' and itemsToPublish: ['s1', 'c2']
          And     'client' starting before 'server'

                  | emitID |	from    |	items   |	type   |
                  | emit1	 | 'server'	| [s1,s2]	| 'INIT' |
                  | emit2	 | 'client'	| [s1,c2]	| 'INIT' |
                  When  'server' subscribes to listen$
                  Then  listen$ will emit 'emit2'

                  When  'client' subscribes to listen$
                  Then  listen$ will emit 'emit1'
                  `, (done) => {
    expect.assertions(2);

    let serverFlag = false;
    let clientFlag = false;

    const serverAddress = getAddress('server1');
    const clientAddress = getAddress('client1');

    let server: ClusterApi.Cluster;
    setTimeout(() => {
      server = joinCluster({
        address: serverAddress,
        itemsToPublish: ['s1', 's2'],
      });
      const serverSubscription = server.listen$().subscribe((res: ClusterEvent) => {
        expect(res).toMatchObject({
          from: getFullAddress(clientAddress),
          items: ['s1', 'c2'],
          type: 'INIT',
        });
        serverFlag = true;
        serverSubscription.unsubscribe();
        isDone();
      });
    }, 1000);

    const client = joinCluster({
      address: clientAddress,
      seedAddress: serverAddress,
      itemsToPublish: ['s1', 'c2'],
    });

    const isDone = async () => {
      if (clientFlag && serverFlag) {
        await server.destroy();
        await client.destroy();
        done();
        // @ts-ignore
        return Promise.resolve();
      }
    };

    client.getCurrentMembersData().then((res: any) => {
      expect(res).toMatchObject({ [getFullAddress(serverAddress)]: ['s1', 's2'] });
      clientFlag = true;
      isDone();
    });
  });
});
