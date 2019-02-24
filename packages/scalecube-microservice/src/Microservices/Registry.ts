import {
  CreateRegistryOptions,
  GetDataFromServiceOptions,
  GetUpdatedMethodRegistryOptions,
  GetUpdatedServiceRegistryOptions,
} from '../api/private/types';
import {
  Registry,
  Service,
  LookupOptions,
  Endpoint,
  ServiceRegistryDataStructure,
  Reference,
  MethodRegistryDataStructure,
} from '../api/public';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import { getQualifier } from '../helpers/serviceData';
import { END_POINT, MICROSERVICE_NOT_EXISTS, REFERENCE } from '../helpers/constants';

export const createRegistry = (): Registry => {
  let serviceRegistry: ServiceRegistryDataStructure | null = {}; // remote
  let methodRegistry: MethodRegistryDataStructure | null = {}; // local

  return Object.freeze({
    lookUpRemote: ({ qualifier }: LookupOptions): Endpoint[] | [] => {
      if (!serviceRegistry) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return serviceRegistry[qualifier] || [];
    },
    lookUpLocal: ({ qualifier }: LookupOptions): Reference => {
      if (!methodRegistry) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      return methodRegistry[qualifier];
    },
    AddToMethodRegistry: ({ services = [] }: CreateRegistryOptions): MethodRegistryDataStructure => {
      if (!methodRegistry) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      methodRegistry = getUpdatedMethodRegistry({
        methodRegistry,
        references: getReferenceFromServices({ services }), // all services => reference[]
      });
      return { ...methodRegistry };
    },

    AddToServiceRegistry: ({ services = [] }: CreateRegistryOptions): ServiceRegistryDataStructure => {
      if (!serviceRegistry) {
        throw new Error(MICROSERVICE_NOT_EXISTS);
      }

      serviceRegistry = getUpdatedServiceRegistry({
        serviceRegistry,
        endpoints: getEndpointsFromServices({ services }) as Endpoint[], // all services => endPoints[]
      });
      return { ...serviceRegistry };
    },
    destroy: (): null => {
      serviceRegistry = null;
      methodRegistry = null;
      return null;
    },
  });
};

// Helpers

export const getEndpointsFromServices = ({ services }: { services: Service[] }): Endpoint[] =>
  services.reduce(
    (res: Endpoint[], service: Service) => [
      ...res,
      ...getDataFromService({
        service,
        type: END_POINT,
      }),
    ],
    []
  );

export const getReferenceFromServices = ({ services }: { services: Service[] }): Reference[] =>
  services.reduce(
    (res: Reference[], service: Service) => [
      ...res,
      ...getDataFromService({
        service,
        type: REFERENCE,
      }),
    ],
    []
  );

export const getUpdatedServiceRegistry = ({
  serviceRegistry,
  endpoints,
}: GetUpdatedServiceRegistryOptions): ServiceRegistryDataStructure => ({
  ...serviceRegistry,
  ...endpoints.reduce(
    (res: ServiceRegistryDataStructure, endpoint: Endpoint) => ({
      ...res,
      [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
    }),
    serviceRegistry || {}
  ),
});

export const getUpdatedMethodRegistry = ({
  methodRegistry,
  references,
}: GetUpdatedMethodRegistryOptions): MethodRegistryDataStructure => ({
  ...methodRegistry,
  ...references.reduce(
    (res: MethodRegistryDataStructure, reference: Reference) => ({
      ...res,
      [reference.qualifier]: reference,
    }),
    methodRegistry || {}
  ),
});

export const getDataFromService = ({ service, type }: GetDataFromServiceOptions): Reference[] | Endpoint[] => {
  let data: Reference[] | Endpoint[] = [];
  const { definition, reference } = service;
  const transport = 'window:/';

  if (isValidServiceDefinition(definition)) {
    const { serviceName, methods } = definition;

    data = Object.keys(methods).map((methodName: string) =>
      Object.assign(
        {
          qualifier: getQualifier({ serviceName, methodName }),
          serviceName,
          methodName,
          asyncModel: methods[methodName].asyncModel,
        },
        type === END_POINT
          ? {
              transport,
              uri: `${transport}/${serviceName}/${methodName}`,
            }
          : {
              reference: {
                [methodName]: reference[methodName].bind(reference),
              },
            }
      )
    );
  } else {
    throw new Error(`service ${definition.serviceName} is not valid.`);
  }

  return data;
};
