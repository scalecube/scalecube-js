import { MicroserviceApi } from '@scalecube/api';
import { GetProxyOptions } from '../helpers/types';
import { getQualifier } from '@scalecube/utils';
import { getServiceMethodIsMissingError } from '../helpers/constants';

export const getProxy = ({ serviceCall, serviceDefinition }: GetProxyOptions) => {
  // workaround to support old browsers
  const obj: { [key: string]: any } = {};
  Object.keys(serviceDefinition.methods).forEach((key: string) => (obj[key] = () => {}));
  return new Proxy(obj, {
    get: preServiceCall({ serviceDefinition, serviceCall }),
  });
};

const preServiceCall = ({ serviceCall, serviceDefinition }: GetProxyOptions) => (target: object, prop: string) => {
  if (!serviceDefinition.methods[prop]) {
    throw new Error(getServiceMethodIsMissingError(prop));
  }

  const { asyncModel } = serviceDefinition.methods[prop];

  return (...data: any[]) => {
    const message: MicroserviceApi.Message = {
      qualifier: getQualifier({ serviceName: serviceDefinition.serviceName, methodName: prop }),
      data,
    };
    return serviceCall({ message, asyncModel, messageFormat: false });
  };
};
