import { DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { saveToLogs } from '@scalecube/utils';
import { tap } from 'rxjs/operators';
import { GetServiceFactoryOptions, SetMicroserviceInstanceOptions } from '../helpers/types';
import { createProxy } from '../Proxy/createProxy';
import { destroy } from './Destroy';
import { createServiceCall } from '../ServiceCall/ServiceCall';

export const setMicroserviceInstance = ({
  microserviceContext,
  transportClientProvider,
  serverStop,
  discoveryInstance,
  endPointsToPublishInCluster,
  address,
  debug,
  defaultRouter,
}: SetMicroserviceInstanceOptions): MicroserviceApi.Microservice => {
  const { remoteRegistry } = microserviceContext;

  discoveryInstance
    .discoveredItems$()
    .pipe(printLogs(microserviceContext.whoAmI, debug))
    .subscribe(remoteRegistry.update);

  const serviceFactoryOptions = getServiceFactoryOptions({
    microserviceContext,
    transportClientProvider,
    defaultRouter,
  });
  return Object.freeze({
    destroy: () => destroy({ microserviceContext, discovery: discoveryInstance, serverStop }),
    ...serviceFactoryOptions,
  });
};

export const getServiceFactoryOptions = ({
  microserviceContext,
  transportClientProvider,
  defaultRouter,
}: GetServiceFactoryOptions) =>
  ({
    createProxy: ({ serviceDefinition, router = defaultRouter }: MicroserviceApi.ProxyOptions) =>
      createProxy({
        serviceDefinition,
        router,
        microserviceContext,
        transportClientProvider,
      }),
    createServiceCall: ({ router = defaultRouter }: { router: MicroserviceApi.Router }) =>
      createServiceCall({
        router,
        microserviceContext,
        transportClientProvider,
      }),
  } as MicroserviceApi.ServiceFactoryOptions);

const printLogs = (whoAmI: string, debug?: boolean) =>
  tap(
    ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) =>
      type !== 'IDLE' &&
      saveToLogs(
        whoAmI,
        `microservice received an updated`,
        {
          [type]: items.map((item) => item.qualifier),
        },
        debug
      )
  );
