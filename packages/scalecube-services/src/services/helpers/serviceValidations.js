import { isObject } from './utils';

export const isValidService = ( service ) => {
  const meta = service.constructor.meta || service.meta;
  return meta ? isContainServiceName(meta.serviceName) && isValidMethods(meta.methods) : false;
};

export const isContainServiceName = ( serviceName ) => {
  if ( typeof serviceName !== 'string' ) {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};

export const isValidMethods = ( methods ) => {

  if ( !methods ) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  if ( !isObject(methods) ) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }

  return Object.keys(methods).every(method => {
    const methodProp = methods[method];
    return isValidMethod({ methodProp, method });
  });
};

export const isValidMethod = ( { methodProp, method } ) => {
  if ( !methodProp.type || (methodProp.type !== 'Promise' && methodProp.type !== 'Observable' )) {
    console.error(new Error(`method ${ method } doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};