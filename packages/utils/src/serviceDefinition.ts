import * as check from './check';
import { getQualifier } from './qualifier';
import {
  SERVICE_NAME_NOT_PROVIDED,
  DEFINITION_MISSING_METHODS,
  INVALID_METHODS,
  ASYNC_MODEL_TYPES,
  getServiceNameInvalid,
  getIncorrectMethodValueError,
  getAsynModelNotProvidedError,
  getInvalidAsyncModelError,
} from './constants';

export const validateServiceDefinition = (definition: any) => {
  check.assertNonEmptyObject(definition);
  const { serviceName, methods } = definition;
  check.assertDefined(serviceName, SERVICE_NAME_NOT_PROVIDED);
  check.assertNonEmptyString(serviceName, getServiceNameInvalid(serviceName));
  check.assertDefined(methods, DEFINITION_MISSING_METHODS);
  check.assertNonEmptyObject(methods, INVALID_METHODS);
  Object.keys(methods).forEach((methodName) => {
    check.assertNonEmptyString(methodName);
    const qualifier = getQualifier({ serviceName, methodName });
    validateAsyncModel(qualifier, methods[methodName]);
  });
};

export const validateAsyncModel = (qualifier: string, val: any) => {
  check.assertNonEmptyObject(val, getIncorrectMethodValueError(qualifier));
  const { asyncModel } = val;
  check.assertDefined(asyncModel, getAsynModelNotProvidedError(qualifier));
  check.assertOneOf(ASYNC_MODEL_TYPES, asyncModel, getInvalidAsyncModelError(qualifier));
};
