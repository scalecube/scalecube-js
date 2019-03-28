import { Observable } from 'rxjs';
import { Message } from '.';
/**
 * Provides an ability to run the method from a microservice container for a specific async model
 */
export default interface ServiceCall {
  /**
   * A method using which a consumer requires a stream and receives an Observable sequence describing updates of
   * the method and qualifier that was used for the invocation
   */
  requestStream: (message: Message) => Observable<Message>;
  /**
   * A method using which a consumer requires data and a provider responds with the data once in the form of
   * promise, that includes the response from the method and qualifier that was used for the invocation
   */
  requestResponse: (message: Message) => Promise<Message>;
}
