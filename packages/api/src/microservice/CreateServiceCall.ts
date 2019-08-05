import { Observable } from 'rxjs';
import { Message, RouterApi } from '..';

/**
 * @interface CreateServiceCall
 */
export type CreateServiceCall = (options: CreateServiceCallOptions) => ServiceCall;

/**
 * @interface CreateServiceCallOptions
 * Options for the creation of Service Call
 */
export default interface CreateServiceCallOptions {
  /**
   * @method
   * Custom router specifies the logic of choosing the appropriate remoteService
   */
  router?: RouterApi.Router;
}

/**
 * @interface ServiceCall
 * Provides an ability to run the method from a microservice container for a specific async model
 */
export interface ServiceCall {
  /**
   * @method
   * A method using which a consumer requires a stream and receives an Observable sequence describing updates of
   * the method and qualifier that was used for the invocation
   */
  requestStream: (message: Message) => Observable<Message>;
  /**
   * @method
   * A method using which a consumer requires data and a provider responds with the data once in the form of
   * promise, that includes the response from the method and qualifier that was used for the invocation
   */
  requestResponse: (message: Message) => Promise<Message>;
}
