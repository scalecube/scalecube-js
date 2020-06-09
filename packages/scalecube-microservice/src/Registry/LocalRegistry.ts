import { MicroserviceApi } from '@scalecube/api';
import {
  AvailableServices,
  CreateLocalRegistry,
  GetReferenceFromServices,
  GetUpdatedLocalRegistry,
  LocalRegistry,
  LocalRegistryMap,
  Reference,
} from '../helpers/types';
import { getQualifier } from '@scalecube/utils';
import { getReferencePointer } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const createLocalRegistry: CreateLocalRegistry = (): LocalRegistry => {
  let localRegistryMap: LocalRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }: MicroserviceApi.LookupOptions) => {
      if (!localRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return localRegistryMap[qualifier] || null;
    },

    add: ({ services = [] }: AvailableServices) => {
      if (!localRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      const references = getReferenceFromServices({ services });
      localRegistryMap = getUpdatedLocalRegistry({
        localRegistryMap,
        references,
      });
    },

    destroy: () => {
      localRegistryMap = null;
    },
  });
};

// Helpers

const getReferenceFromServices: GetReferenceFromServices = ({ services = [] }) =>
  services.reduce(
    (res: Reference[], service: MicroserviceApi.Service) => [
      ...res,
      ...getReferenceFromService({
        service,
      }),
    ],
    []
  );

const getUpdatedLocalRegistry: GetUpdatedLocalRegistry = ({ localRegistryMap, references }) => ({
  ...localRegistryMap,
  ...references.reduce(
    (res: LocalRegistryMap, reference: Reference) => ({
      ...res,
      [reference.qualifier]: reference,
    }),
    localRegistryMap || {}
  ),
});

const getReferenceFromService = ({ service }: { service: MicroserviceApi.Service }): Reference[] => {
  const data: Reference[] = [];
  const { definition, reference } = service;

  const { serviceName, methods } = definition;
  Object.keys(methods).forEach((methodName: string) => {
    const qualifier = getQualifier({ serviceName, methodName });
    data.push({
      qualifier,
      serviceName,
      methodName,
      asyncModel: methods[methodName].asyncModel,
      reference: {
        [methodName]: getReferencePointer({ reference, methodName }),
      },
    });
  });
  return data;
};
