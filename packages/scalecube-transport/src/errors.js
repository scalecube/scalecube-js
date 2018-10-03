// @flow
import { allowedRequestTypes } from './const';

export const errors = {
  wrongUrl: 'URI has a wrong format',
  wrongType: `Type should be one of these: ${allowedRequestTypes.join(', ')}`,
  wrongEntrypoint: 'Entrypoint should be a string and should begin with "/"',
  wrongResponsesLimit: 'ResponsesLimit should be a number and be greater than zero',
  noProvider: 'No provider has been set to the transport',
  urlNotFound: 'Provided url can not be found - no connection',
  connectionRefused: 'Refused connection to the provided url',
  wrongKeepAlive: 'KeepAlive should be a positive number',
  wrongLifetime: 'Lifetime should be a positive number',
  wrongWebSocket: 'WebSocket should be a class',
  closedConnection: 'The connection was closed',
  noConnection: 'There is no connection',
  cantStartServer: 'Can not start server with a provided configuration',
  wrongCallbackForListen: 'Callback for "listen" is not correct - function should return an Observable',
};
