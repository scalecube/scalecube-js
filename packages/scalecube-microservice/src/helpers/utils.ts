export const generateIdentifier = () => `_${(Math.random() * Date.now()).toString(36).substr(2, 9)}`;

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getMethodName = (service) => getServiceMeta(service).methodName;

export const getServiceMeta = (service) => service.constructor.meta || service.meta;

export const getServiceNamespace = (service) => `${getServiceName(service)}/${getMethodName(service)}`;

export const isObject = (obj) => {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};
