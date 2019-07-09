import { Address, MicroserviceApi } from '@scalecube/api';
import { throwError } from 'rxjs';
import { ASYNC_MODEL_TYPES } from './constants';

export const isObject = (obj: object) => obj && typeof obj === 'object' && obj.constructor === Object;

export const isFunction = (obj: object) => obj && obj instanceof Function;

export const isString = (str: string) => str && typeof str === 'string';

export const throwErrorFromServiceCall = ({
  asyncModel,
  errorMessage,
}: {
  asyncModel: MicroserviceApi.AsyncModel;
  errorMessage: string;
}) => {
  const error = new Error(errorMessage);
  console.warn(errorMessage);
  return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(error) : throwError(error);
};

export const getGlobalNamespace = () => (typeof window === 'undefined' ? global : window);

export const getDefaultAddress = (port = 8080): Address => ({
  host: 'defaultHost',
  port,
  protocol: 'pm',
  path: 'path',
});
