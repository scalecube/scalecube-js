import { Message } from '../api/public';
import { GetProxyOptions } from '../api/private/types';
import { getQualifier } from '../helpers/serviceData';
import { isValidAsyncModel } from '../helpers/serviceValidation';

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
  if (!isValidAsyncModel({ asyncModel })) {
    throw new Error(`service method asyncModel has unknown type error: ${serviceDefinition.serviceName}.${prop}`);
  }

  return (...data: any[]) => {
    const message: Message = {
      qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
      data,
    };
    return serviceCall({ message, asyncModel, includeMessage: false });
  };
};
