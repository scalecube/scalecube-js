import {
  AvailableService,
  AvailableServices,
  GetUpdatedMethodRegistryOptions,
  MethodRegistry,
  MethodRegistryMap,
} from '../api/private/types';
import { Service, Reference } from '../api/public';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import { getQualifier } from '../helpers/serviceData';
import { MICROSERVICE_NOT_EXISTS } from '../helpers/constants';
import { isFunction } from '../helpers/utils';

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

      methodRegistryMap = getUpdatedMethodRegistry({
        methodRegistryMap,
        references: getReferenceFromServices({ services }),
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

export const getReferenceFromServices = ({ services }: AvailableServices): Reference[] | [] =>
  services
    ? services.reduce(
        (res: Reference[], service: Service) => [
          ...res,
          ...getReferenceFromService({
            service,
          }),
        ],
        []
      )
    : [];

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
  let data: Reference[] = [];
  const { definition, reference } = service;

  if (isValidServiceDefinition(definition)) {
    const { serviceName, methods } = definition;

    data = Object.keys(methods).map((methodName: string) => ({
      qualifier: getQualifier({ serviceName, methodName }),
      serviceName,
      methodName,
      asyncModel: methods[methodName].asyncModel,
      reference: {
        [methodName]: isFunction(reference) ? reference : reference[methodName].bind(reference),
      },
    }));
  } else {
    throw new Error(`service ${definition.serviceName} is not valid.`);
  }

  return data;
};
