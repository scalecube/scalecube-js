import { Address, DiscoveryApi, MicroserviceApi } from '@scalecube/api';
import { getFullAddress, saveToLogs } from '@scalecube/utils';
import { tap } from 'rxjs/operators';
import { GetServiceFactoryOptions, SetMicroserviceInstanceOptions } from '../helpers/types';
import { createProxies, createProxy } from '../Proxy/createProxy';
import { destroy } from './Destroy';
import { createServiceCall } from '../ServiceCall/ServiceCall';
import { isServiceAvailableInRegistry } from '../helpers/serviceData';

export const setMicroserviceInstance = ({
  microserviceContext,
  transportClientProvider,
  serverStop,
  discoveryInstance,
  endPointsToPublishInCluster,
  address,
  debug,
}: SetMicroserviceInstanceOptions): MicroserviceApi.Microservice => {
  const { remoteRegistry } = microserviceContext;

  const isServiceAvailable = isServiceAvailableInRegistry(
    endPointsToPublishInCluster,
    remoteRegistry,
    discoveryInstance
  );

  discoveryInstance
    .discoveredItems$()
    .pipe(printLogs(address, debug))
    .subscribe(remoteRegistry.update);

  const serviceFactoryOptions = getServiceFactoryOptions({ microserviceContext, transportClientProvider });
  return Object.freeze({
    createProxies: (createProxiesOptions: MicroserviceApi.CreateProxiesOptions) =>
      createProxies({
        createProxiesOptions,
        microserviceContext,
        isServiceAvailable,
        transportClientProvider,
      }),
    destroy: () => destroy({ microserviceContext, discovery: discoveryInstance, serverStop }),
    ...serviceFactoryOptions,
  });
};

export const getServiceFactoryOptions = ({ microserviceContext, transportClientProvider }: GetServiceFactoryOptions) =>
  ({
    createProxy: (proxyOptions: MicroserviceApi.ProxyOptions) =>
      createProxy({
        ...proxyOptions,
        microserviceContext,
        transportClientProvider,
      }),
    createServiceCall: ({ router }: { router: MicroserviceApi.Router }) =>
      createServiceCall({
        router,
        microserviceContext,
        transportClientProvider,
      }),
  } as MicroserviceApi.ServiceFactoryOptions);

const printLogs = (address: Address, debug?: boolean) =>
  tap(
    ({ type, items }: DiscoveryApi.ServiceDiscoveryEvent) =>
      type !== 'IDLE' &&
      saveToLogs(
        getFullAddress(address),
        `microservice received an updated`,
        {
          [type]: [...items],
        },
        debug
      )
  );