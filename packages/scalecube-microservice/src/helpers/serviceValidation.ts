import { isObject } from './utils';
import { getServiceMeta } from './serviceData';

export const isValidRawService = (service) => {
  const meta = getServiceMeta(service);
  return meta ? isValidServiceName(meta.serviceName) && isValidMethods(meta.methods) : false;
};

export const isValidServiceName = (serviceName) => {
  if (typeof serviceName !== 'string') {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};

export const isValidMethods = (methods) => {
  if (!isObject(methods)) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  return Object.keys(methods).every((method) => isValidMethod({ methodProp: methods[method], method }));
};

export const isValidMethod = ({ methodProp, method }) => {
  if (!methodProp.asyncModel || (methodProp.asyncModel !== 'Promise' && methodProp.asyncModel !== 'Observable')) {
    console.error(new Error(`method ${method} doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};
