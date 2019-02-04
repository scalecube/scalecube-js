import { getServiceMeta } from '../helpers/utils';
import { createDispatcher } from '../Dispatcher';
import { Message } from '../api/Message';

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
  if (typeof meta.methods[prop] === 'undefined') {
    return null;
  }
  const type = meta.methods[prop].type;

  return (...data) => {
    const message: Message = {
      serviceName: meta.serviceName,
      method: prop,
      data,
    };

    if (meta.methods[prop].type !== 'Promise' && meta.methods[prop].type !== 'Observable') {
      return Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
    }

    return dispatcher({ message, type });
  };
};
