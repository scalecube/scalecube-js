import { getAddress, getFullAddress } from '@scalecube/utils';
import { joinCluster } from '../../../src';
import { getMultiInitClientFromServer } from '../../../src/helpers/constants';

describe('Test address collusion - 2 members with the same address that act as seed', () => {
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
      seedAddress: [serverAddress],
      itemsToPublish: ['s1', 'c2'],
      debug: true,
    });

    client.listen$().subscribe((res: any) => {
      expect(spy.mock.calls[1][0]).toMatch(
        getMultiInitClientFromServer(getFullAddress(clientAddress), getFullAddress(serverAddress))
      );
      spy.mockRestore();
      spy.mockClear();
      done();
    });
  });
});
