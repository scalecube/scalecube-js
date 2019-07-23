import { getAddress, getFullAddress } from '@scalecube/utils';
import { joinCluster } from '../../../src';
import { getMultiInitClientFromServer } from '../../../src/helpers/constants';

describe('Test address collusion', () => {
  test(`
  Scenario: 2 servers with same address and 1 client
        Given   cluster with address: 'server' and itemsToPublish: [s1, s2] 
        And     cluster with address: 'server' and itemsToPublish: [s3, s4] 
        And     cluster with address: 'client' ,  seedAddress: 'server' and itemsToPublish: [s1, c2] 
        And     both servers starting before 'client'
        When    trying to connect 
        Then    address collusion warning will occur
        `, (done) => {
    const serverAddress = getAddress('server');
    const clientAddress = getAddress('client');
    const spy = jest.spyOn(console, 'warn');

    const server = joinCluster({
      address: serverAddress,
      itemsToPublish: ['s1', 's2'],
    });

    const server2 = joinCluster({
      address: serverAddress,
      itemsToPublish: ['s3', 's4'],
    });

    const client = joinCluster({
      address: clientAddress,
      seedAddress: serverAddress,
      itemsToPublish: ['s1', 'c2'],
    });

    client.listen$().subscribe((res: any) => {
      expect(spy.mock.calls[0][0]).toMatch(
        getMultiInitClientFromServer(getFullAddress(clientAddress), getFullAddress(serverAddress))
      );
      spy.mockRestore();
      spy.mockClear();
      done();
    });
  });

  test.only(`
    Scenario: 1 server and 2 clients with same address
        Given  cluster with address: 'server' and itemsToPublish: [s1, s2] 
        And    cluster with address: 'client' ,  seedAddress: 'server' and itemsToPublish: [s1, c2] 
        And    cluster with address: 'client' ,  seedAddress: 'server' and itemsToPublish: [s2, c1] 
        And    both servers starting before 'client'
        When   trying to connect 
        Then   address collusion exception will occur
        `, (done) => {
    const serverAddress = getAddress('server');
    const clientAddress = getAddress('client');
    const spy = jest.spyOn(console, 'warn');

    const server = joinCluster({
      address: serverAddress,
      itemsToPublish: ['s1', 's2'],
    });

    const client = joinCluster({
      address: clientAddress,
      seedAddress: serverAddress,
      itemsToPublish: ['s1', 'c2'],
    });

    const client2 = joinCluster({
      address: clientAddress,
      seedAddress: serverAddress,
      itemsToPublish: ['s2', 'c1'],
    });

    client.listen$().subscribe((res: any) => {
      expect(spy.mock.calls[0][0]).toMatch(
        getMultiInitClientFromServer(getFullAddress(serverAddress), getFullAddress(clientAddress))
      );
      spy.mockRestore();
      spy.mockClear();
      done();
    });
  });
});
