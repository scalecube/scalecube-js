import * as check from './check';
import {
  SEED_ADDRESS_IS_NOT_STRING,
  SERVICES_IS_NOT_ARRAY,
  SERVICE_IS_NOT_OBJECT,
  MICROSERVICE_OPTIONS_IS_NOT_OBJECT,
  SERVICE_DEFINITION_NOT_PROVIDED,
  SERVICE_REFERENCE_NOT_PROVIDED,
  SERVICE_NAME_NOT_PROVIDED,
  DEFINITION_MISSING_METHODS,
  INVALID_METHODS,
  getServiceNameInvalid,
  ASYNC_MODEL_TYPES,
  ASYNC_MODEL_NOT_PROVIDED,
  INVALID_ASYNC_MODEL,
  INVALID_SERVICE_REFERENCE,
} from './constants';
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
  check.assertDefined(reference, SERVICE_REFERENCE_NOT_PROVIDED);
  validateServiceDefinition(definition);
  validateServiceReference(reference, definition);
};

export const validateServiceDefinition = (definition: any) => {
  check.assertNonEmptyObject(definition);
  const { serviceName, methods } = definition;
  check.assertDefined(serviceName, SERVICE_NAME_NOT_PROVIDED);
  check.assertDefined(methods, DEFINITION_MISSING_METHODS);
  check.assertNonEmptyString(serviceName, getServiceNameInvalid(serviceName));
  check.assertNonEmptyObject(methods, INVALID_METHODS);
  Object.keys(methods).forEach((name) => {
    check.assertNonEmptyString(name);
    validateAsyncModel(methods[name]);
  });
};

export const validateAsyncModel = (val: any) => {
  check.assertNonEmptyObject(val);
  const { asyncModel } = val;
  check.assertDefined(asyncModel, ASYNC_MODEL_NOT_PROVIDED);
  check.assertOneOf(ASYNC_MODEL_TYPES, asyncModel, INVALID_ASYNC_MODEL);
};

export const validateServiceReference = (reference: any, definition: ServiceDefinition) => {
  check.assertNonEmptyObject(reference, INVALID_SERVICE_REFERENCE);
  Object.keys(definition.methods).forEach((methodName) => {
    check.assertFunction(reference[methodName]);
  });
};
