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

export const validateBuildConfig = ({ URI = '', keepAlive, lifetime, WebSocket }) => {
  if (!URI.match(/^wss?:\/\/.*/)) {
    return errors.wrongUrl;
  }
  if (keepAlive && (typeof keepAlive !== 'number' || keepAlive > 0)) {
    return errors.wrongKeepAlive;
  }
  if (lifetime && (typeof lifetime !== 'number' || lifetime > 0)) {
    return errors.wrongLifetime;
  }
  if (WebSocket && typeof WebSocket !== 'function') {
    return errors.wrongWebSocket;
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
