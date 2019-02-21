import { CreateRegistryOptions } from '../api/private/types';
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

export const createRegistry = (): Registry => {
  let serviceRegistry: ServiceRegistryDataStructure = {}; // remote
  let methodRegistry: MethodRegistryDataStructure = {}; // local

  return Object.freeze({
    lookUpRemote: ({ qualifier }: LookupOptions): Endpoint[] | [] => serviceRegistry[qualifier] || [],
    lookUpLocal: ({ qualifier }: LookupOptions): Reference => methodRegistry[qualifier],
    AddToMethodRegistry: ({ services = [] }: CreateRegistryOptions) => {
      methodRegistry = getUpdatedMethodRegistry({
        methodRegistry,
        references: getReferenceFromServices({ services }), //all services => reference[]
      });
    },
    AddToServiceRegistry: ({ services = [] }: CreateRegistryOptions) => {
      serviceRegistry = getUpdatedServiceRegistry({
        serviceRegistry,
        endpoints: getEndpointsFromServices({ services }) as Endpoint[], //all services => endPoints[]
      });
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
        type: 'endPoint',
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
        type: 'reference',
      }),
    ],
    []
  );

export const getUpdatedServiceRegistry = ({
  serviceRegistry,
  endpoints,
}: {
  serviceRegistry: ServiceRegistryDataStructure;
  endpoints: Endpoint[];
}) => ({
  ...serviceRegistry,
  ...endpoints.reduce(
    (res: ServiceRegistryDataStructure, endpoint: Endpoint) => ({
      ...res,
      [endpoint.qualifier]: [...(res[endpoint.qualifier] || []), endpoint],
    }),
    {}
  ),
});

export const getUpdatedMethodRegistry = ({
  methodRegistry,
  references,
}: {
  methodRegistry: MethodRegistryDataStructure;
  references: Reference[];
}) => ({
  ...methodRegistry,
  ...references.reduce(
    (res: MethodRegistryDataStructure, reference: Reference) => ({
      ...res,
      [reference.qualifier]: reference,
    }),
    {}
  ),
});

export const getDataFromService = ({
  service,
  type,
}: {
  service: Service;
  type: 'reference' | 'endPoint';
}): Reference[] | Endpoint[] => {
  let data: Reference[] | Endpoint[] = [];
  const { definition, reference } = service;
  const { serviceName } = definition;
  const transport = 'window:/';

  if (isValidServiceDefinition(definition)) {
    data = Object.keys(definition.methods).map((methodName: string) =>
      type === 'endPoint'
        ? {
            qualifier: getQualifier({ serviceName, methodName }),
            serviceName,
            methodName,
            transport,
            uri: `${transport}/${serviceName}/${methodName}`,
          }
        : {
            qualifier: getQualifier({ serviceName, methodName }),
            serviceName,
            methodName,
            reference: {
              [methodName]: reference[methodName].bind(reference),
            },
          }
    );
  }

  return data;
};
