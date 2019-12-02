import { MicroserviceApi } from '@scalecube/api';
import { constants } from '@scalecube/utils';

export const { ASYNC_MODEL_TYPES } = constants;
export const MICROSERVICE_NOT_EXISTS = 'MS0000 - microservice does not exists';
export const MESSAGE_NOT_PROVIDED = 'MS0001 - Message has not been provided';
export const MESSAGE_DATA_NOT_PROVIDED = 'MS0002 - Message data has not been provided';
export const MESSAGE_QUALIFIER_NOT_PROVIDED = 'MS0003 - Message qualifier has not been provided';
export const INVALID_MESSAGE = 'MS0004 - Message should not to be empty object';
export const INVALID_QUALIFIER = 'MS0005 - qualifier expected to be service/method format';
export const SERVICE_DEFINITION_NOT_PROVIDED = 'MS0006 - Service missing definition';
export const WRONG_DATA_FORMAT_IN_MESSAGE = 'MS0007 - Message format error: data must be Array';
export const SERVICES_IS_NOT_ARRAY = 'MS0008 - Not valid format, services must be an Array';
export const SERVICE_IS_NOT_OBJECT = 'MS0009 - Not valid format, service must be an Object';
export const MICROSERVICE_OPTIONS_IS_NOT_OBJECT = 'MS0000 - Not valid format, MicroserviceOptions must be an Object';
export const QUALIFIER_IS_NOT_STRING = 'MS0011 - qualifier should not be empty string';
export const TRANSPORT_NOT_PROVIDED = 'MS0013 - Transport provider is not define';
export const ROUTER_NOT_PROVIDED = 'MS0024 - Router is not define';

export const getServiceMethodIsMissingError = (methodName: string) =>
  `MS0014 - service method '${methodName}' missing in the serviceDefinition`;
export const getNotFoundByRouterError = (whoAmI: string, qualifier: string) =>
  `MS0015 - ${whoAmI} can't find services that match the give criteria: '${JSON.stringify(qualifier)}'`;
export const getAsyncModelMissmatch = (
  expectedAsyncModel: MicroserviceApi.AsyncModel,
  receivedAsyncModel: MicroserviceApi.AsyncModel
) => `MS0016 - asyncModel does not match, expect ${expectedAsyncModel}, but received ${receivedAsyncModel}`;
export const getMethodNotFoundError = (message: MicroserviceApi.Message) => `Can't find method ${message.qualifier}`;
export const getInvalidMethodReferenceError = (qualifier: string) =>
  `MS0017 - service (${qualifier}) has valid definition but reference is not a function.`;

export const getServiceReferenceNotProvidedError = (serviceName: string) =>
  `MS0018 - service does not uphold the contract, ${serviceName} is not provided`;
export const getInvalidServiceReferenceError = (serviceName: string) =>
  `MS0019 - Not valid format, ${serviceName} reference must be an Object`;

export const getIncorrectServiceImplementForPromise = (whoAmI: string, qualifier: string) =>
  `MS0025 - ${whoAmI}'s service '${qualifier}' define as Promise but service return not Promise`;

export const getIncorrectServiceImplementForObservable = (whoAmI: string, qualifier: string) =>
  `MS0026 - ${whoAmI}'s service '${qualifier}' define as Observable but service return not Observable`;

export const getIncorrectServiceInvoke = (whoAmI: string, qualifier: string) =>
  `MS0027 - ${whoAmI}'s ${qualifier} has no valid response, expect Promise or Observable`;

export const NO_PROXY_SUPPORT = 'MS0029 - Proxy not supported, please add Proxy polyfill';
