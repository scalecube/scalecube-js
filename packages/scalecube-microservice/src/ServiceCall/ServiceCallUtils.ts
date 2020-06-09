import { MicroserviceContext } from '../helpers/types';
import { saveToLogs } from '@scalecube/utils';

export const serviceCallError = ({
  errorMessage,
  microserviceContext,
}: {
  errorMessage: string;
  microserviceContext: MicroserviceContext | null;
}) => {
  const error = new Error(errorMessage);
  if (microserviceContext) {
    const { whoAmI, debug } = microserviceContext;
    saveToLogs(whoAmI, errorMessage, {}, debug, 'warn');
  }
  return error;
};
