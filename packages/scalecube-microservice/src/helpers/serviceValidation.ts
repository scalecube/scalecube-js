import { isObject } from './utils';
import { ServiceDefinition } from '../api2/public';
import AsyncModel from '../api2/public/AsyncModel';

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
  if (!methodData.asyncModel || (methodData.asyncModel !== 'Promise' && methodData.asyncModel !== 'Observable')) {
    console.error(new Error(`method ${methodName} doesn't contain valid  type (asyncModel)`));
    return false;
  }
  return true;
};
