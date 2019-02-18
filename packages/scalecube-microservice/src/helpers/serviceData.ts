import Qualifier from '../api2/Qualifier';

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getMethodName = (service) => getServiceMeta(service).methodName;

export const getServiceMeta = (service) => service.constructor.meta || service.meta;

export const getServiceNamespace = (service) => `${getServiceName(service)}/${getMethodName(service)}`;

export const getServiceNamespaceFromMessage = (qualifier: Qualifier) =>
  `${qualifier.serviceName}/${qualifier.methodName}`;
