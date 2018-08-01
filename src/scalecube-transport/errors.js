import { allowedRequestTypes } from './const';

export const errors = {
  wrongUrl: 'Url should start with ws(s?)://',
  wrongType: `Type should be one of these: ${allowedRequestTypes.join(', ')}`,
  wrongEntrypoint: 'Entrypoint should be a string and should begin with "/"',
  wrongResponsesLimit: 'ResponsesLimit should be a number and be greater than zero',
  noProvider: 'No provider has been set to the transport',
  urlNotFound: 'Provided url can not be found - no connection',
  connectionRefused: 'Refused connection to the provided url'
};
