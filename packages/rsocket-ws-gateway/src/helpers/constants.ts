export const SERVICE_CALL_MUST_BE_OBJECT = 'service call must be an object';
export const REQUEST_STREAM_MUST_BE_FUNCTION = 'requestStream must be a function';
export const REQUEST_RESPONSE_MUST_BE_FUNCTION = 'requestResponse must be a function';

export const getInvalidRequestHandler = (name: string, type) =>
  `invalid custom ${name}, receive ${type} instead of Function`;
