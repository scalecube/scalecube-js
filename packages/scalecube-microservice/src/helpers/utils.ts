import { throwError } from 'rxjs';
import { AsyncModel } from '../api';
import { ASYNC_MODEL_TYPES } from './constants';

export const isObject = (obj: object) => obj && typeof obj === 'object' && obj.constructor === Object;

export const isFunction = (obj: object) => obj && obj instanceof Function;

export const throwErrorFromServiceCall = ({
  asyncModel,
  errorMessage,
}: {
  asyncModel: AsyncModel;
  errorMessage: string;
}) => {
  const error = new Error(errorMessage);
  console.warn(errorMessage);
  return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(error) : throwError(error);
};
