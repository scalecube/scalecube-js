import { getServiceMeta } from '../helpers/serviceData';
import { createDispatcher } from '../Dispatcher';
import { Message } from '../api/Message';

const allowedMethodTypes = ['Promise', 'Observable'];

export const createProxy = ({ serviceRegistry, preRequest$, postResponse$, serviceContract, router }) => {
  const meta = getServiceMeta(serviceContract);
  const dispatcher = createDispatcher({ router, serviceRegistry, preRequest$, postResponse$ });

  return new Proxy(
    {},
    {
      get: validateMeta({ meta, dispatcher }),
    }
  );
};

const validateMeta = ({ meta, dispatcher }) => (target, prop) => {
  if (!meta.methods[prop]) {
    throw Error(`service method ${prop} missing in the metadata`);
  }

  const type = meta.methods[prop].type;

  return (...data) => {
    const message: Message = {
      serviceName: meta.serviceName,
      method: prop,
      data,
    };

    if (!allowedMethodTypes.includes(meta.methods[prop].type)) {
      throw Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
    }

    return dispatcher({ message, type });
  };
};
