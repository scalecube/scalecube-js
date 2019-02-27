import { Message } from '../api/public';
import { GetProxyOptions } from '../api/private/types';
import { getQualifier } from '../helpers/serviceData';
import { isValidServiceDefinition } from '../helpers/serviceValidation';
import {
  getServiceIsNotValidError,
  getServiceMethodIsMissingError,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
} from '../helpers/constants';

export const getProxy = ({ serviceCall, serviceDefinition }: GetProxyOptions) => {
  if (!isValidServiceDefinition(serviceDefinition)) {
    if (!serviceDefinition) {
      throw new Error(SERVICE_DEFINITION_NOT_PROVIDED);
    }
    if (!serviceDefinition.serviceName) {
      throw new Error(SERVICE_NAME_NOT_PROVIDED);
    }

    throw new Error(getServiceIsNotValidError(serviceDefinition.serviceName));
  }

  return new Proxy(
    {},
    {
      get: preServiceCall({ serviceDefinition, serviceCall }),
    }
  );
};

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
    return serviceCall({ message, asyncModel, includeMessage: false });
  };
};
