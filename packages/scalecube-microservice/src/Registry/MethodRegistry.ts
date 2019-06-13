import {
  AvailableService,
  AvailableServices,
  GetUpdatedMethodRegistryOptions,
  MethodRegistry,
  MethodRegistryMap,
} from '../helpers/types';
import { Service, Reference } from '../api';
import { getQualifier, getReferencePointer } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';

export const createMethodRegistry = (): MethodRegistry => {
  let methodRegistryMap: MethodRegistryMap | null = {};

  return Object.freeze({
    lookUp: ({ qualifier }): Reference | null => {
      if (!methodRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return methodRegistryMap[qualifier] || null;
    },
    add: ({ services = [] }: AvailableServices): MethodRegistryMap => {
      if (!methodRegistryMap) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }
      const references = getReferenceFromServices({ services });
      methodRegistryMap = getUpdatedMethodRegistry({
        methodRegistryMap,
        references,
      });
      return { ...methodRegistryMap };
    },

    destroy: (): null => {
      methodRegistryMap = null;
      return null;
    },
  } as MethodRegistry);
};

// Helpers

export const getReferenceFromServices = ({ services = [] }: AvailableServices): Reference[] | [] =>
  services.reduce(
    (res: Reference[], service: Service) => [
      ...res,
      ...getReferenceFromService({
        service,
      }),
    ],
    []
  );

export const getUpdatedMethodRegistry = ({
  methodRegistryMap,
  references,
}: GetUpdatedMethodRegistryOptions): MethodRegistryMap => ({
  ...methodRegistryMap,
  ...references.reduce(
    (res: MethodRegistryMap, reference: Reference) => ({
      ...res,
      [reference.qualifier]: reference,
    }),
    methodRegistryMap || {}
  ),
});

export const getReferenceFromService = ({ service }: AvailableService): Reference[] => {
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
