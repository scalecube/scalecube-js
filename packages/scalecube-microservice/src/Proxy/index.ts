import { createDispatcher } from '../Dispatcher';
import { Message } from '../api/Message';

const allowedMethodTypes = ['Promise', 'Observable'];

export const createProxy = ({ serviceContract, dispatcher, proxy }) => {
  return new Proxy(
    {},
    {
      get: prepareServiceCall({ meta: serviceContract, dispatcher, proxy }),
    }
  );
};

export const proxyDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  return createDispatcher({ router, serviceRegistry, getPreRequest$, postResponse$ });
};

const prepareServiceCall = ({ meta, dispatcher, proxy }) => (target, prop) => {
  console.log('prepareServiceCall target', target);
  console.log('prepareServiceCall prop', prop);

  if (!meta.methods[prop]) {
    const error = Error(`service method '${prop}' missing in the metadata`);
    console.warn(error);
    throw error;
  }

  const { asyncModel } = meta.methods[prop];

  return (...data) => {
    const message: Message = {
      serviceName: meta.serviceName,
      methodName: prop,
      data,
      proxy,
    };

    if (!allowedMethodTypes.includes(asyncModel)) {
      throw Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
    }

    return dispatcher({ message, type: asyncModel });
  };
};
