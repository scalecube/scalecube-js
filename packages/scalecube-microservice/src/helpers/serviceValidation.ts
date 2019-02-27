import { isObject } from './utils';
import { ASYNC_MODEL_TYPES } from './constants';
import { ServiceDefinition, AsyncModel } from '../api/public';

export const isValidServiceDefinition = (definition: ServiceDefinition) => {
  return definition ? isValidServiceName(definition.serviceName) && isValidMethods(definition.methods) : false;
};

export const isValidServiceName = (serviceName: string) => {
  if (typeof serviceName !== 'string') {
    console.error(new Error('Service missing serviceName:string'));
    return false;
  }
  return true;
};

export const isValidMethods = (methods: { [methodName: string]: { asyncModel: AsyncModel } }) => {
  if (!isObject(methods)) {
    console.error(new Error('Service missing methods:object'));
    return false;
  }
  return Object.keys(methods).every((methodName) => isValidMethod({ methodData: methods[methodName], methodName }));
};

export const isValidMethod = ({
  methodData,
  methodName,
}: {
  methodData: { asyncModel: string };
  methodName: string;
}) => {
  if (!isValidAsyncModel({ asyncModel: methodData.asyncModel as AsyncModel })) {
    console.error(new Error(`method ${methodName} doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};

export const isValidAsyncModel = ({ asyncModel }: { asyncModel: AsyncModel }) =>
  Object.values(ASYNC_MODEL_TYPES).includes(asyncModel);
