export const generateIdentifier = () => `_${(Math.random() * Date.now()).toString(36).substr(2, 9)}`;

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getMethodName = (service) => getServiceMeta(service).methodName;

export const getServiceMeta = (service) => service.constructor.meta || service.meta;

export const getServiceNamespace = (service) => `${getServiceName(service)}/${getMethodName(service)}`;

export const isValidRawService = (service) => {
  const meta = getServiceMeta(service);
  return meta ? isValidServiceName(meta.serviceName) && isValidMethods(meta.methods) : false;
};

const isValidServiceName = (serviceName) => {
  if (typeof serviceName !== 'string') {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};

const isValidMethods = (methods) => {
  if (!isObject(methods)) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  return Object.keys(methods).every((method) => isValidMethod({ methodProp: methods[method], method }));
};

const isValidMethod = ({ methodProp, method }) => {
  if (!methodProp.asyncModel || (methodProp.asyncModel !== 'Promise' && methodProp.asyncModel !== 'Observable')) {
    console.error(new Error(`method ${method} doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};

export const isObject = (obj) => {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};
