import { isObject, isPrimitiveNoSymbol } from './utils';
import {
  ASYNC_MODEL_TYPES,
  DEFINITION_MISSING_METHODS,
  getMethodsAreNotDefinedProperly,
  getServiceNameInvalid,
  SERVICE_DEFINITION_NOT_PROVIDED,
} from './constants';
import { AsyncModel, PrimitiveTypesNoSymbol, ServiceDefinition } from '../api';
import { IsValid } from './types';

export const isValidServiceDefinition = (definition: ServiceDefinition): IsValid => {
  if (!definition) {
    return {
      isValid: false,
      exception: new Error(SERVICE_DEFINITION_NOT_PROVIDED),
    };
  }

  const { serviceName, methods } = definition;

  const serviceNameValidation = isValidServiceName(serviceName);
  if (!serviceNameValidation.isValid) {
    return serviceNameValidation;
  }

  const methodsValidation = isValidMethods(methods, serviceName);
  if (!methodsValidation.isValid) {
    return methodsValidation;
  }

  return {
    isValid: true,
    exception: null,
  };
};

export const isValidServiceName = (serviceName: PrimitiveTypesNoSymbol): IsValid => {
  if (!isPrimitiveNoSymbol(serviceName)) {
    return {
      isValid: false,
      exception: new Error(getServiceNameInvalid()),
    };
  }
  return {
    isValid: true,
    exception: null,
  };
};

export const isValidMethods = (
  methods: { [methodName: string]: { asyncModel: AsyncModel } },
  serviceName: PrimitiveTypesNoSymbol
): IsValid => {
  if (!isObject(methods)) {
    return {
      isValid: false,
      exception: new Error(DEFINITION_MISSING_METHODS),
    };
  }

  const notValidMethods = Object.keys(methods).filter((methodName) =>
    methods[methodName] ? !isValidMethod({ methodData: methods[methodName] }) : true
  );

  return {
    isValid: notValidMethods.length === 0,
    exception:
      notValidMethods.length === 0 ? null : new Error(getMethodsAreNotDefinedProperly(serviceName, notValidMethods)),
  };
};

export const isValidMethod = ({ methodData }: { methodData: { asyncModel: string } }) => {
  return isObject(methodData) ? isValidAsyncModel({ asyncModel: methodData.asyncModel as AsyncModel }) : false;
};

export const isValidAsyncModel = ({ asyncModel }: { asyncModel: AsyncModel }) =>
  Object.values(ASYNC_MODEL_TYPES).includes(asyncModel);
