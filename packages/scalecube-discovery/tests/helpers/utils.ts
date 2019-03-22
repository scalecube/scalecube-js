import { isObservable } from 'rxjs';
import { createDiscovery } from '../../src/Discovery/Discovery'
import { Discovery } from '../../src/api'

export const expectWithFailNow = (expect: () => void, done: { fail: (error: Error) => void }) => {
  try {
    expect();
  } catch (error) {
    done.fail(error);
  }
};

export const createEndpoint = (methodIndex: number = 1, clusterIndex: number = 1, serviceIndex: number = 1) => {
  const id = `${methodIndex}` + `${clusterIndex}`;
  const serviceName = `serviceName${serviceIndex}`;
  const methodName = `methodName${id}`;
  const transport = 'transport';
  const qualifier = `${serviceName}/${methodName}`;
  const uri = `${transport}/${qualifier}`;
  const address = `address${id}`;
  return {
    uri,
    transport,
    qualifier,
    serviceName,
    methodName,
    asyncModel: 'requestResponse',
    address,
  };
};

export const createDiscoveriesWithSameSeedAddress = (clusterIndex: number = 1) => {
  const seedAddress = `cluster${clusterIndex}`;
  const endPoint1 = createEndpoint(1, clusterIndex);
  const endPoint2 = createEndpoint(2, clusterIndex);
  const endPoint3 = createEndpoint(3, clusterIndex);
  const discovery1 = createDiscovery({ address: `address1${clusterIndex}`, seedAddress, endPoints: [endPoint1] });
  const discovery2 = createDiscovery({ address: `address2${clusterIndex}`, seedAddress, endPoints: [endPoint2] });
  const discovery3 = createDiscovery({ address: `address3${clusterIndex}`, seedAddress, endPoints: [endPoint3] });
  return {
    seedAddress,
    endPoint1,
    endPoint2,
    endPoint3,
    discovery1,
    discovery2,
    discovery3,
  };
};

export const testNotifier = (discovery: Discovery, expectations: any[], done: any, callDoneOnLastEmit = false) => {
  let updates = 0;
  discovery.notifier.subscribe((data) => {
    expectWithFailNow(() => {
      expect(data).toEqual(expectations[updates]);
    }, done);
    updates++;
    if (expectations.length === updates && callDoneOnLastEmit) {
      done();
    }
  });
};

export const testNodesContent = (clusterIndex: number = 1) => {
  const { seedAddress, endPoint1, endPoint2, endPoint3 } = createDiscoveriesWithSameSeedAddress(clusterIndex);
  window.scalecube.clusters[seedAddress].nodes.forEach((node, nodeIndex) => {
    expect(Object.keys(node)).toHaveLength(3);
    expect(node.address).toBe(`address${nodeIndex + 1}${clusterIndex}`);
    expect(isObservable(node.subjectNotifier)).toBeTruthy();
    switch (nodeIndex) {
      case 0: {
        expect(node.endPoints).toEqual([endPoint2, endPoint3]);
        break;
      }
      case 1: {
        expect(node.endPoints).toEqual([endPoint1, endPoint3]);
        break;
      }
      case 2: {
        expect(node.endPoints).toEqual([endPoint1, endPoint2]);
      }
      default: {
        break;
      }
    }
  });
};
