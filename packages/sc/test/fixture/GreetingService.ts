import { GreetingServiceAPI } from './GreetingServiceAPI';

export class GreetingService implements GreetingServiceAPI {
  public greet(name: string) {
    return Promise.resolve(`Hello ${name}`);
  }
}
