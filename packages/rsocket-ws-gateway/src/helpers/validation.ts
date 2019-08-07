import { check } from '@scalecube/utils';
import {
  getInvalidRequestHandler,
  REQUEST_STREAM_MUST_BE_FUNCTION,
  REQUEST_RESPONSE_MUST_BE_FUNCTION,
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
  check.assertFunction(requestResponse, REQUEST_RESPONSE_MUST_BE_FUNCTION);
  check.assertFunction(requestStream, REQUEST_STREAM_MUST_BE_FUNCTION);
};
