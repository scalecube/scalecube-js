// export const getServiceName = (service) => getServiceMeta(service).serviceName;
//
// export const getMethodName = (service) => getServiceMeta(service).methodName;
//
// export const getServiceMeta = (service) => service.constructor.meta || service.meta;
//
// export const getServiceNamespace = (service) => `${getServiceName(service)}/${getMethodName(service)}`;
//
// export const getServiceNamespaceFromMessage = (qualifier: Qualifier) =>
//   `${qualifier.serviceName}/${qualifier.methodName}`;

import { GetQualifierOptions } from '../api2/private/types';

export const getServiceName = ({ qualifier }: { qualifier: string }) => qualifier.split('/')[0];

export const getMethodName = ({ qualifier }: { qualifier: string }) => qualifier.split('/')[1];

export const getQualifier = ({ serviceName, methodName }: GetQualifierOptions) => `${serviceName}/${methodName}`;
