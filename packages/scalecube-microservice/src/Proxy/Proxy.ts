import { AsyncModel, Message } from '../api/public';
import { GetProxyOptions } from '../api/private/types';
import { getQualifier } from '../helpers/serviceData';

const allowedMethodTypes = [AsyncModel.Observable, AsyncModel.Promise];

export const getProxy = ({ serviceCall, serviceDefinition }: GetProxyOptions) => {
  return new Proxy(
    {},
    {
      get: preServiceCall({ serviceDefinition, serviceCall }),
    }
  );
};

const preServiceCall = ({ serviceCall, serviceDefinition }: GetProxyOptions) => (target: object, prop: string) => {
  if (!serviceDefinition.methods[prop]) {
    throw new Error(`service method '${prop}' missing in the metadata`);
  }
  const { asyncModel } = serviceDefinition.methods[prop];
  if (!allowedMethodTypes.includes(asyncModel)) {
    throw new Error(`service method unknown type error: ${serviceDefinition.serviceName}.${prop}`);
  }

  return (...data: any[]) => {
    const message: Message = {
      qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
      data,
    };
    return serviceCall({ message, asyncModel, includeMessage: false });
  };
};
