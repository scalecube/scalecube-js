import { Router } from '.';

/**
 * Options for the creation of Service Call
 */
export default interface CreateServiceCallOptions {
  /**
   * Custom router helps to specify the logic of choosing the appropriate endpoint, that matches given criteria
   */
  router?: Router;
}
