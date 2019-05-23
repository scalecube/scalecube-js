import * as check from './check';
import {
  SEED_ADDRESS_IS_NOT_STRING,
  SERVICES_IS_NOT_ARRAY,
  SERVICE_IS_NOT_OBJECT,
  MICROSERVICE_OPTIONS_IS_NOT_OBJECT,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
  DEFINITION_MISSING_METHODS,
  INVALID_METHODS,
  getServiceNameInvalid,
  ASYNC_MODEL_TYPES,
  getIncorrectMethodValueError,
  getInvalidMethodReferenceError,
  getAsynModelNotProvidedError,
  getInvalidAsyncModelError,
  getInvalidServiceReferenceError,
  getServiceReferenceNotProvidedError,
} from './constants';
import { getQualifier } from '../helpers/serviceData';
import ServiceDefinition from '../api/ServiceDefinition';

export const validateMicroserviceOptions = (microserviceOptions: any) => {
  check.assertObject(microserviceOptions, MICROSERVICE_OPTIONS_IS_NOT_OBJECT);
  const { services, seedAddress } = microserviceOptions;
  check.assertNonEmptyString(seedAddress, SEED_ADDRESS_IS_NOT_STRING);
  check.assertArray(services, SERVICES_IS_NOT_ARRAY);
  services.forEach(validateService);
};

export const validateService = (service: any) => {
  check.assertNonEmptyObject(service, SERVICE_IS_NOT_OBJECT);
  const { definition, reference } = service;
  check.assertDefined(definition, SERVICE_DEFINITION_NOT_PROVIDED);
  validateServiceDefinition(definition);
  const { serviceName } = definition;
  check.assertDefined(reference, getServiceReferenceNotProvidedError(serviceName));
  validateServiceReference(reference, definition);
};

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

export const validateServiceReference = (reference: any, definition: ServiceDefinition) => {
  const { serviceName } = definition;
  check.assertObject(reference, getInvalidServiceReferenceError(serviceName));
  Object.keys(definition.methods).forEach((methodName) => {
    const qualifier = getQualifier({ serviceName, methodName });
    const staticMethodRef = reference.constructor && reference.constructor[methodName];
    check.assertFunction(reference[methodName] || staticMethodRef, getInvalidMethodReferenceError(qualifier));
  });
};
