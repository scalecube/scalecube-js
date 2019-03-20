import { Router } from '.';

/**
 * Options for the creation of Service Call
 */
export default interface CreateServiceCallOptions {
  /**
   * Custom router specifies the logic of choosing the appropriate remoteService
   */
  router?: Router;
}
