import { throwError } from 'rxjs6';
import { AsyncModel, ObservableAsyncModel, PromiseAsyncModel } from '../api/public';

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
  return asyncModel === asyncModelTypes.promise ? Promise.reject(error) : throwError(error);
};

export const asyncModelTypes: { observable: ObservableAsyncModel; promise: PromiseAsyncModel } = {
  observable: 'Observable',
  promise: 'Promise',
};
