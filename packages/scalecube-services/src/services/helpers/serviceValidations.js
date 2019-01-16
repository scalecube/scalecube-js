export const isValidService = ( service ) => {
  let isValid = true;
  const meta = service.constructor.meta || service.meta;

  if ( meta ) {

    isValid = isContainServiceName(meta) && isContainMethods(meta);

  } else {
    isValid = false;
  }

  return isValid;
};

const isContainServiceName = ( meta ) => {
  if ( typeof meta.serviceName !== 'string' ) {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};

const isContainMethods = ( meta ) => {

  if ( !meta.methods ) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  if ( meta.methods && typeof meta.methods !== 'object' ) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }

  let isValid = true;
  Object.keys(meta.methods).forEach(key => {
    const method = meta.methods[key];

    if ( method.type !== 'Promise' && method.type !== 'Observable' ) {
      isValid = false;
      console.error(new Error(`method ${key} doesn't contain type (asyncModel)`));
    }
  });

  return isValid;
};