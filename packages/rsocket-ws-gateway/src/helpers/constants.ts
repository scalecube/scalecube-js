export const SERVICE_CALL_MUST_BE_FUNCTION = 'service call must be a function';

export const getInvalidRequestHandler = (name: string, type) =>
  `invalid custom ${name}, receive ${type} instead of Function`;
