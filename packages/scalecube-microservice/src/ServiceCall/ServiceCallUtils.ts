import { MicroserviceApi } from '@scalecube/api';
import { MicroserviceContext } from '../helpers/types';
import { saveToLogs } from '@scalecube/utils';
import { ASYNC_MODEL_TYPES } from '../helpers/constants';
import { throwError } from 'rxjs';

export const throwErrorFromServiceCall = ({
  asyncModel,
  errorMessage,
  microserviceContext,
}: {
  asyncModel: MicroserviceApi.AsyncModel;
  errorMessage: string;
  microserviceContext: MicroserviceContext | null;
}) => {
  const error = new Error(errorMessage);
  if (microserviceContext) {
    const { whoAmI, debug } = microserviceContext;
    saveToLogs(whoAmI, errorMessage, {}, debug, 'warn');
  }
  return asyncModel === ASYNC_MODEL_TYPES.REQUEST_RESPONSE ? Promise.reject(error) : throwError(error);
};
