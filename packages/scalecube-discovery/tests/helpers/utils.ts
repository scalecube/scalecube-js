import createDiscovery from '../../src/index'

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
  const discovery1 = createDiscovery({ address: `address1${clusterIndex}`, seedAddress, itemsToPublish: [endPoint1] });
  const discovery2 = createDiscovery({ address: `address2${clusterIndex}`, seedAddress, itemsToPublish: [endPoint2] });
  const discovery3 = createDiscovery({ address: `address3${clusterIndex}`, seedAddress, itemsToPublish: [endPoint3] });

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

