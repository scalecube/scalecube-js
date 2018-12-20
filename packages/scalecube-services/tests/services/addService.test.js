import GreetingService from "examples/GreetingServiceClass/GreetingService.js";
import {Microservices, ServicesConfig} from "../../src/services";

describe("Add service after creating", () => {
    it("Greeting.hello should greet Idan with hello", () => {
        let x = new GreetingService();
        const mc = Microservices
            .builder()
            .build();

        mc
            .serviceRegistery
            .register(new ServicesConfig(x));

        const greetingService = mc
            .proxy()
            .api(GreetingService)
            .create();

        expect.assertions(1);
        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
    it("Greeting.hello 2 should greet Idan with hello", () => {
        let x = new GreetingService();
        const mc = Microservices
            .builder()
            .services(x)
            .build();

        const mc1 = Microservices
            .builder()
            .build();
        Object.values(mc.serviceRegistery.services).forEach(
            (s) => s.forEach(j=>mc1.serviceRegistery.register(j))
        );

        const greetingService = mc1
            .proxy()
            .api(GreetingService)
            .create();

        expect.assertions(1);
        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
});
