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

export const SERVICE_NAME_NOT_PROVIDED = 'MS0020 - Invalid format, definition must contain valid serviceName';
export const DEFINITION_MISSING_METHODS = 'MS0021 - Invalid format, definition must contain valid methods';
export const INVALID_METHODS = 'MS0022 - Invalid format, definition must contain valid methods';
export const getServiceNameInvalid = (serviceName: any) =>
  `MS0023 - Invalid format, serviceName must be not empty string but received type ${typeof serviceName}`;

export const getIncorrectMethodValueError = (qualifier: string) =>
  `Method value for ${qualifier} definition should be non empty object`;
export const getAsynModelNotProvidedError = (qualifier: string) =>
  `Async model is not provided in service definition for ${qualifier}`;
export const getInvalidAsyncModelError = (qualifier: string) =>
  `Invalid async model in service definition for ${qualifier}`;
