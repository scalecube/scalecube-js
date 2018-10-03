// @flow
import { errors } from './errors';
import { allowedRequestTypes } from './const';
import { TransportClientProviderConfig, TransportRequest } from './api/types';

export const validateRequest = (requestData: TransportRequest, propsToOmitValidation?: Object) => {
  if (!propsToOmitValidation) {
    propsToOmitValidation = {};
  }
  const { headers = {}, entrypoint } = requestData;
  const { type, responsesLimit } = headers;
  if (!propsToOmitValidation.type && !allowedRequestTypes.includes(type)) {
    return errors.wrongType;
  }
  if (!propsToOmitValidation.entrypoint && (!entrypoint || typeof entrypoint !== 'string' || entrypoint[0] !== '/' || entrypoint.length < 3)) {
    return errors.wrongEntrypoint;
  }
  if (!propsToOmitValidation.responsesLimit && responsesLimit && (typeof responsesLimit !== 'number' || responsesLimit < 1)) {
    return errors.wrongResponsesLimit;
  }
};

export const validateBuildConfig = (config: TransportClientProviderConfig) => {
  const { URI = '', keepAlive, lifetime, WebSocket } = config;
  if (typeof URI !== 'string' || !URI) {
    return errors.wrongUrl;
  }
  if (keepAlive && (typeof keepAlive !== 'number' || keepAlive < 0)) {
    return errors.wrongKeepAlive;
  }
  if (lifetime && (typeof lifetime !== 'number' || lifetime < 0)) {
    return errors.wrongLifetime;
  }
  if (WebSocket && typeof WebSocket !== 'function') {
    return errors.wrongWebSocket;
  }
};

export const extractConnectionError = (error: Error) => {
  if (error.message.includes('ENOTFOUND')) {
    return new Error(errors.urlNotFound);
  } else if (error.message.includes('ECONNREFUSED')) {
    return new Error(errors.connectionRefused);
  } else if (error.message === 'RSocketClient: Connection closed.') {
    return new Error(errors.noConnection);
  }
  return new Error(error.message);
};

export const getTextResponseSingle = (text: string) => `Echo:${text}`;

export const getTextResponseMany = (index: number) => (text: string) => `Greeting (${index}) to: ${text}`;

export const getFailingOneResponse = (text: string) => ({ errorCode: 500, errorMessage: text });

export const getFailingManyResponse = (text: string) => ({ errorCode: 500, errorMessage: getTextResponseSingle(text) });
