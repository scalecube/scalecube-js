import { Message } from '@scalecube/api';
import { GetProxyOptions } from '../helpers/types';
import { getQualifier } from '../helpers/serviceData';
import { getServiceMethodIsMissingError } from '../helpers/constants';

export const getProxy = ({ serviceCall, serviceDefinition }: GetProxyOptions) =>
  new Proxy(
    {},
    {
      get: preServiceCall({ serviceDefinition, serviceCall }),
    }
  );

const preServiceCall = ({ serviceCall, serviceDefinition }: GetProxyOptions) => (target: object, prop: string) => {
  if (!serviceDefinition.methods[prop]) {
    throw new Error(getServiceMethodIsMissingError(prop));
  }

  const { asyncModel } = serviceDefinition.methods[prop];

  return (...data: any[]) => {
    const message: Message = {
      qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
      data,
    };
    return serviceCall({ message, asyncModel, messageFormat: false });
  };
};
