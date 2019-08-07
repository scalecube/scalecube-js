import { check } from '@scalecube/utils';
import { getInvalidRequestHandler, SERVICE_CALL_MUST_BE_FUNCTION } from './constants';

export const validateCustomHandlers = (name: string, customHandler: any) => {
  if (!check.isDefined(customHandler)) {
    return;
  }
  check.assertFunction(customHandler, getInvalidRequestHandler(name, typeof customHandler));
};

export const validateServiceCall = (serviceCall: any) => {
  check.assertObject(serviceCall, SERVICE_CALL_MUST_BE_FUNCTION);
  const { requestResponse, requestStream } = serviceCall;
  check.assertFunction(requestResponse);
  check.assertFunction(requestStream);
};
