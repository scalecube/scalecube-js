import { joinCluster } from '../../src';
import { getFullAddress } from '@scalecube/utils';
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

    const serverAddress = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8123,
      path: '',
    };

    const clientAddress = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8124,
      path: '',
    };

    const http = require('http');
    const s8123 = http.createServer().listen(8123);

    const server = joinCluster({
      address: serverAddress,
      itemsToPublish: ['s1', 's2'],
    });

    const serverSubscription = server.listen$().subscribe((res: ClusterEvent) => {
      expect(res).toMatchObject({
        from: getFullAddress(clientAddress),
        items: ['s1', 'c2'],
        type: 'ADDED',
      });
      serverFlag = true;
      serverSubscription.unsubscribe();
      isDone();
    });

    const s8124 = http.createServer().listen(8124);

    const client = joinCluster({
      address: clientAddress,
      seedAddress: [serverAddress],
      itemsToPublish: ['s1', 'c2'],
    });

    const clientSubscription = client.listen$().subscribe((res: ClusterEvent) => {
      expect(res).toMatchObject({
        from: getFullAddress(serverAddress),
        items: ['s1', 's2'],
        type: 'ADDED',
      });
      clientFlag = true;
      clientSubscription.unsubscribe();
      isDone();
    });

    const isDone = async () => {
      if (clientFlag && serverFlag) {
        await server.destroy();
        await client.destroy();
        s8124.close();
        s8123.close(done);
        // @ts-ignore
        return Promise.resolve();
      }
    };
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

    const serverAddress = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8123,
      path: '',
    };

    const clientAddress = {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 8124,
      path: '',
    };

    const http = require('http');
    const s8123 = http.createServer().listen(8123);
    const s8124 = http.createServer().listen(8124);

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
          type: 'ADDED',
        });
        serverFlag = true;
        serverSubscription.unsubscribe();
        isDone();
      });
    }, 1000);

    const client = joinCluster({
      address: clientAddress,
      seedAddress: [serverAddress],
      itemsToPublish: ['s1', 'c2'],
    });

    const isDone = async () => {
      if (clientFlag && serverFlag) {
        await server.destroy();
        await client.destroy();
        s8124.close();
        s8123.close(done);
        done();
        // @ts-ignore
        return Promise.resolve();
      }
    };

    client.listen$().subscribe((res: any) => {
      expect(res).toMatchObject({
        from: getFullAddress(serverAddress),
        items: ['s1', 's2'],
        type: 'ADDED',
      });
      clientFlag = true;
      isDone();
    });
  });
});
