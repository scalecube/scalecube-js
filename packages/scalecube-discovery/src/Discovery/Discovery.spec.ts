import { Discovery } from './Discovery';
import { Observable } from 'rxjs';
import { Endpoint } from '@scalecube/scalecube-microservice/src/api/public';
import { ASYNC_MODEL_TYPES } from '@scalecube/scalecube-microservice/src/helpers/constants';

describe('Test Discovery', () => {
  beforeEach(() => {
    // @ts-ignore-next-line
    window.scalecube.discovery = {};
  });

  const endPoint: Endpoint = {
    uri: '',
    transport: '',
    qualifier: 'serviceName/methodName',
    serviceName: 'serviceName',
    methodName: 'methodName',
    asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    address: '',
  };

  it('Test Discovery.create add Nodes to cluster', () => {
    const seedAddress = 'myNamespace';
    // @ts-ignore-next-line
    expect(window.scalecube.discovery[seedAddress]).toBeUndefined();

    Discovery.create({ address: 'cluster1', seedAddress, endPoints: [] });
    Discovery.create({ address: 'cluster2', seedAddress, endPoints: [] });
    // @ts-ignore-next-line
    expect(window.scalecube.discovery[seedAddress].cluster).toHaveLength(2);
    // @ts-ignore-next-line
    expect(Object.keys(window.scalecube.discovery)).toHaveLength(1);
  });

  it('Test Discovery.create add Nodes to cluster by its seedAddress', () => {
    Discovery.create({ address: 'cluster1', seedAddress: 'seedAddress1', endPoints: [] });
    Discovery.create({ address: 'cluster2', seedAddress: 'seedAddress2', endPoints: [] });
    // @ts-ignore-next-line
    expect(Object.keys(window.scalecube.discovery)).toHaveLength(2);
  });

  it('Test Discovery.create expose methods', () => {
    const discovery = Discovery.create({ address: 'cluster1', seedAddress: 'seedAddress1', endPoints: [] });
    expect(Object.keys(discovery)).toHaveLength(2);
    expect(discovery).toEqual(
      expect.objectContaining({
        end: expect.any(Function),
        subscriber: expect.any(Observable),
      })
    );
  });

  it('Test subscribe to cluster', (done) => {
    expect.assertions(3);
    let step = 0;
    const discovery = Discovery.create({
      address: 'cluster1',
      seedAddress: 'seedAddress1',
      endPoints: [endPoint, endPoint],
    });
    discovery.subscribe((endPoints) => {
      switch (step) {
        case 0:
          expect(endPoints).toHaveLength(0);
          step++;
          break;
        case 1:
          expect(endPoints).toHaveLength(1);
          step++;
          break;
      }
    });

    const discovery2 = Discovery.create({ address: 'cluster2', seedAddress: 'seedAddress1', endPoints: [endPoint] });

    discovery2.subscribe((endPoints) => {
      expect(endPoints).toHaveLength(2);
      step++;
      if (step === 3) {
        done();
      }
    });
  });

  it('Test end node in cluster', (done) => {
    expect.assertions(3);
    let step = 0;
    const endpoint1 = { ...endPoint, address: 'cluster1' };
    const endpoint2 = { ...endPoint, address: 'cluster2' };
    const discovery = Discovery.create({
      address: 'cluster1',
      seedAddress: 'seedAddress1',
      endPoints: [endpoint1, endpoint1],
    });
    const discovery2 = Discovery.create({ address: 'cluster2', seedAddress: 'seedAddress1', endPoints: [endpoint2] });

    discovery.subscribe((endPoints) => {
      switch (step) {
        case 0:
          expect(endPoints).toHaveLength(1);
          step++;
          break;
        case 1:
          expect(endPoints).toHaveLength(0);
          step++;
          break;
      }
    });

    discovery2.destroy().then((response: string) => {
      expect(response).toMatch(`${endpoint2.address} as been removed from seedAddress1`);
      if (step === 2) {
        done();
      }
    });
  });
});