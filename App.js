// @flow
//import * as ServiceA from './ServiceA.js';
import GreetingService from './GreetingService.js';
import { Microservices } from './sdk/Microservices.js';


const greetingService = Microservices.builder().services(GreetingService, GreetingService).build().proxy().api(GreetingService);

console.log(greetingService.hello());

