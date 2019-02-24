import { throwErrorFromServiceCall } from '../helpers/utils';
import { from } from 'rxjs6';
import { map } from 'rxjs6/operators';
import {
  AddMessageToResponseOptions,
  InvokeMethodOptions,
  LocalCallOptions,
  ServiceCallResponse,
} from '../api/private/types';

export const localCall = ({
  localService,
  asyncModel,
  includeMessage,
  message,
}: LocalCallOptions): ServiceCallResponse => {
  const { reference, asyncModel: asyncModelProvider } = localService;
  const method = reference && reference[localService.methodName];

  if (asyncModelProvider !== asyncModel) {
    return throwErrorFromServiceCall({
      asyncModel,
      errorMessage: `asyncModel miss match, expect ${asyncModel} but received ${asyncModelProvider}`,
    });
  }

  if (method) {
    return invokeMethod({ method, message }).pipe(addMessageToResponse({ includeMessage, message }));
  } else {
    return throwErrorFromServiceCall({
      asyncModel,
      errorMessage: `Can't find method ${message.qualifier}`,
    });
  }
};

export const invokeMethod = ({ method, message }: InvokeMethodOptions) => from(method(message.data)).pipe();

export const addMessageToResponse = ({ includeMessage, message }: AddMessageToResponseOptions) =>
  map((response: any) => {
    if (includeMessage) {
      return {
        ...message,
        data: response,
      };
    }
    return response;
  });
