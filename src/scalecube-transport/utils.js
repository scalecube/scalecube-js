import { errors } from './errors';
import { allowedRequestTypes } from './const';

export const validateRequest = ({ type, serviceName, actionName, responsesLimit }) => {
  if (!allowedRequestTypes.includes(type)) {
    return errors.wrongType;
  }
  if (!serviceName || typeof serviceName !== 'string') {
    return errors.wrongServiceName;
  }
  if (!actionName || typeof actionName !== 'string') {
    return errors.wrongActionName;
  }
  if (responsesLimit && (typeof responsesLimit !== 'number' || responsesLimit < 1)) {
    return errors.wrongResponsesLimit;
  }
};
