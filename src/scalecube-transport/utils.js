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

export const validateBuildConfig = ({ url }) => {
  if (!url.match(/^wss?:\/\/.*/)) {
    return errors.wrongUrl;
  }
};

export const extractConnectionError = ({ message }) => {
  if (message.includes('ENOTFOUND')) {
    return new Error(errors.urlNotFound);
  } else if (message.includes('ECONNREFUSED')) {
    return new Error(errors.connectionRefused);
  }
  return new Error(message);
};
