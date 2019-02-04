export const generateIdentifier = () => Date.now();

export const getServiceName = (service) => getServiceMeta(service).serviceName;

export const getServiceMeta = (service) => service.meta || service.constructor.meta;

export const isValidRawService = (service) => {
  const meta = service.constructor.meta || service.meta;
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
  if (!methodProp.type || (methodProp.type !== 'PROMISE' && methodProp.type !== 'OBSERVABLE')) {
    console.error(new Error(`method ${method} doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};

export const isObject = (obj) => {
  return obj && typeof obj === 'object' && obj.constructor === Object;
};
