import Message from '../api2/Message';

const allowedMethodTypes = ['Promise', 'Observable'];

export const createProxy = ({ serviceCall, serviceDefinition, microservice }) => {
  return new Proxy(
    {},
    {
      get: preDispatch({ serviceDefinition, serviceCall, microservice }),
    }
  );
};

const preDispatch = ({ serviceDefinition, serviceCall, microservice }) => (target, prop) => {
  if (!serviceDefinition.methods[prop]) {
    throw new Error(`service method '${prop}' missing in the metadata`);
  }

  const { asyncModel } = serviceDefinition.methods[prop];

  return (...requestParams) => {
    const message: Message = {
      qualifier: {
        serviceName: serviceDefinition.serviceName,
        methodName: prop,
      },
      serviceDefinition,
      requestParams,
      microservice,
    };

    if (!allowedMethodTypes.includes(asyncModel)) {
      throw Error(`service method unknown type error: ${serviceDefinition.serviceName}.${prop}`);
    }

    return serviceCall({ message, type: asyncModel });
  };
};
