/**
 * greet users
 * @Service GreetingService
 * @Version v1
 */
export interface GreetingServiceAPI {
  /**
   * Greet user with a friendly hello
   * @Service GreetingService
   * @Method greet
   * @param {string} name name of the user to greet
   * @return {Promise<string>} The greeting to greet user
   */
  greet: (name: string) => Promise<string>;
}
