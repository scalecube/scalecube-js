import { MicroserviceApi } from '@scalecube/api';

export const NOT_VALID_PROTOCOL = 'Not a valid protocol';
export const NOT_VALID_ADDRESS = 'Address must be of type object';
export const NOT_VALID_HOST = 'Not a valid host';
export const NOT_VALID_PATH = 'Not a valid path';
export const NOT_VALID_PORT = 'Not a valid port';

export const ASYNC_MODEL_TYPES: {
  REQUEST_STREAM: MicroserviceApi.RequestStreamAsyncModel;
  REQUEST_RESPONSE: MicroserviceApi.RequestResponseAsyncModel;
} = {
  REQUEST_RESPONSE: 'requestResponse',
  REQUEST_STREAM: 'requestStream',
};

export const SERVICE_NAME_NOT_PROVIDED = '(serviceDefinition.serviceName) is not defined';
export const DEFINITION_MISSING_METHODS = 'Definition missing methods:object';
export const INVALID_METHODS = 'service definition methods should be non empty object';
export const getServiceNameInvalid = (serviceName: any) =>
  `serviceName is not valid, must be none empty string but received type ${typeof serviceName}`;

export const getIncorrectMethodValueError = (qualifier: string) =>
  `Method value for ${qualifier} definition should be non empty object`;
export const getAsynModelNotProvidedError = (qualifier: string) =>
  `Async model is not provided in service definition for ${qualifier}`;
export const getInvalidAsyncModelError = (qualifier: string) =>
  `Invalid async model in service definition for ${qualifier}`;
