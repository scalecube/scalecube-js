import { getServiceMeta } from '../helpers/serviceData';
import { createDispatcher } from '../Dispatcher';
import { Message } from '../api/Message';

const allowedMethodTypes = ['Promise', 'Observable'];

export const createProxy = ({ serviceContract, dispatcher, proxy }) => {
  const meta = getServiceMeta(serviceContract);
  return new Proxy(
    {},
    {
      get: validateMeta({ meta, dispatcher, proxy }),
    }
  );
};

export const proxyDispatcher = ({ router, serviceRegistry, getPreRequest$, postResponse$ }) => {
  return createDispatcher({ router, serviceRegistry, getPreRequest$, postResponse$ });
};

const validateMeta = ({ meta, dispatcher, proxy }) => (target, prop) => {
  if (!meta.methods[prop]) {
    throw Error(`service method ${prop} missing in the metadata`);
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
