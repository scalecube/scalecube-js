import { check } from '@scalecube/utils';
import {
  getInvalidRequestHandler,
  REQUST_STREAM_MUST_BE_FUNCTION,
  REQUST_RESPONSE_MUST_BE_FUNCTION,
  SERVICE_CALL_MUST_BE_OBJECT,
} from './constants';

export const validateCustomHandlers = (name: string, customHandler: any) => {
  if (!check.isDefined(customHandler)) {
    return;
  }
  check.assertFunction(customHandler, getInvalidRequestHandler(name, typeof customHandler));
};

export const validateServiceCall = (serviceCall: any) => {
  check.assertObject(serviceCall, SERVICE_CALL_MUST_BE_OBJECT);
  const { requestResponse, requestStream } = serviceCall;
  check.assertFunction(requestResponse, REQUST_RESPONSE_MUST_BE_FUNCTION);
  check.assertFunction(requestStream, REQUST_STREAM_MUST_BE_FUNCTION);
};
