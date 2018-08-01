import { allowedRequestTypes } from './const';

export const errors = {
  wrongType: `Type should be one of these: ${allowedRequestTypes.join(', ')}`,
  wrongEntrypoint: 'Entrypoint should be a string and should begin with "/"',
  wrongResponsesLimit: 'ResponsesLimit should be a number and be greater than zero',
  noProvider: 'No provider has been set to the transport'
};
