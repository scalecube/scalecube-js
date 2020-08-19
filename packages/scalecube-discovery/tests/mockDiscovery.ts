import { createDiscovery as discovery } from '../src';
import { joinCluster } from '@scalecube/cluster-browser/src';

export const createDiscovery = (config: any) => {
  return discovery({
    cluster: joinCluster,
    ...config,
    debug: true,
  });
};
