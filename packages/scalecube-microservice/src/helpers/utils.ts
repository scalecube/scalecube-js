import { throwError } from 'rxjs6';
import { AsyncModel } from '../api2/public';

export const isObject = (obj: object) => obj && typeof obj === 'object' && obj.constructor === Object;

export const throwErrorFromServiceCall = ({
  asyncModel,
  errorMessage,
}: {
  asyncModel: AsyncModel;
  errorMessage: string;
}) => {
  const error = new Error(errorMessage);
  console.warn(errorMessage);
  return asyncModel === 'Promise' ? Promise.reject(error) : throwError(error);
};
