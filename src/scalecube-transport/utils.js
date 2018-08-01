import { errors } from './errors';
import { allowedRequestTypes } from './const';

export const validateRequest = ({ headers: { type, responsesLimit }, entrypoint }) => {
  if (!allowedRequestTypes.includes(type)) {
    return errors.wrongType;
  }
  if (!entrypoint || typeof entrypoint !== 'string' || entrypoint[0] !== '/' || entrypoint.length < 3) {
    return errors.wrongEntrypoint;
  }
  if (responsesLimit && (typeof responsesLimit !== 'number' || responsesLimit < 1)) {
    return errors.wrongResponsesLimit;
  }
};
