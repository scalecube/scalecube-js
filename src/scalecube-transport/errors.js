import { allowedRequestTypes } from './const';

export const errors = {
  wrongType: `Type should be one of these: ${allowedRequestTypes.join(', ')}`,
  wrongServiceName: 'ServiceName should be a string',
  wrongActionName: 'ActionName should be a string',
  wrongResponsesLimit: 'ResponsesLimit should be a number and be greater than zero'
};
