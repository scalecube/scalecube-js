import { DiscoveryApi } from '@scalecube/api';
import { MicroserviceContext } from '../helpers/types';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { destroyAllClientConnections } from '../TransportProviders/MicroserviceClient';

export const destroy = ({
  microserviceContext,
  discovery,
  serverStop,
}: {
  microserviceContext: MicroserviceContext | null;
  discovery: DiscoveryApi.Discovery;
  serverStop: any;
}) => {
  if (!microserviceContext) {
    throw new Error(MICROSERVICE_NOT_EXISTS);
  }

  return new Promise((resolve, reject) => {
    if (microserviceContext) {
      const { localRegistry, remoteRegistry } = microserviceContext;
      localRegistry.destroy();
      remoteRegistry.destroy();
      destroyAllClientConnections(microserviceContext);
    }

    serverStop && serverStop();

    discovery &&
      discovery.destroy().then(() => {
        microserviceContext = null;
        resolve('');
      });
  });
};
