import Message from '../api2/Message';

const allowedMethodTypes = ['Promise', 'Observable'];

export const createProxy = ({ serviceDefinition, dispatcher, microservice }) => {
  return new Proxy(
    {},
    {
      get: preDispatch({ serviceDefinition, dispatcher, microservice }),
    }
  );
};

const preDispatch = ({ serviceDefinition, dispatcher, microservice }) => (target, prop) => {
  console.log('preDispatch target', target);
  console.log('preDispatch prop', prop);

  if (!serviceDefinition.methods[prop]) {
    throw new Error(`service method '${prop}' missing in the metadata`);
  }

  const { asyncModel } = serviceDefinition.methods[prop];

  return (...data) => {
    const message: Message = {
      serviceName: serviceDefinition.serviceName,
      methodName: prop,
      data,
      microservice,
    };

    if (!allowedMethodTypes.includes(asyncModel)) {
      throw Error(`service method unknown type error: ${serviceDefinition.serviceName}.${prop}`);
    }

    return dispatcher({ message, type: asyncModel });
  };
};
