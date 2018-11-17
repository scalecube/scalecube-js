import GreetingService from 'examples/GreetingServiceClass/GreetingService.js';
import {Microservices} from '../../src/services';

describe('Service proxy middleware suite', () => {
    it('MW should add idan', () => {

        let x = GreetingService;
        const greetingService = Microservices
            .builder()
            .services(new GreetingService(), new GreetingService())
            .build()
            .proxy()
            .mw((message) => {
                message.data.push('Idan');
                return message;
            })
            .api(GreetingService)
            .create();

        expect.assertions(1);
        return expect(greetingService.hello()).resolves.toEqual("Hello Idan");
    });
    it('MW should get service definition and microservices', (done) => {
        expect.assertions(2);

        const mc = Microservices
            .builder()
            .services(new GreetingService(), new GreetingService())
            .build();
        const greetingService = mc.proxy()
            .mw((message, thisMc, def) => {
                expect(thisMc).toEqual(mc);
                expect(def).toEqual(GreetingService.meta);
                done();
                return message;
            })
            .api(GreetingService)
            .create();

        return greetingService.hello();
    });
});
