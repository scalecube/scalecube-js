// @flow
//import * as ServiceA from './ServiceA.js';
import GreetingService from './GreetingService.js';
import { Microservices } from 'src/scalecube-services';


const greetingService = Microservices.builder().services(GreetingService, GreetingService).build().proxy().api(GreetingService);

console.log(greetingService.hello());

