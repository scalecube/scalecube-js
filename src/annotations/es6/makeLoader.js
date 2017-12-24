// @flow

const makeLoader = (loadFunction, Class) => {
    return {
    promise: loadFunction,
    meta: Object.assign(Class.meta, {
      type: 'Loader',
      serviceName: 'GreetingService'
    })
  };
};

export default makeLoader;
