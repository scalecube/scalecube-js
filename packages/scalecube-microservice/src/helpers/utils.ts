import { throwError } from 'rxjs';
import { AsyncModel } from '../api/public';
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

/* tslint:disable */
// https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export const uuidv4 = () =>
  ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
    typeof crypto !== 'undefined'
      ? (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
      : 'test'
  );
/* tslint:enable */
