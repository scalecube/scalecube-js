import GreetingService from "../../../../examples/GreetingServiceClass/GreetingService.js";
import { Microservices } from "../../src/services";

describe("Service proxy middleware suite", () => {
    it("preRequest should add idan", () => {
        expect.assertions(1);

        const ms = Microservices
            .builder()
            .preRequest((req$) => {
                return req$
                    .map((req) => {
                        req.message.data.push("Idan");
                        return req;
                    });
            })
            .services(new GreetingService(), new GreetingService())
            .build();

        const greetingService = ms
            .proxy()
            .api(GreetingService)
            .create();

        return expect(greetingService.hello()).resolves.toEqual("Hello Idan");
    });

    it("preRequest should get service definition and microservices", () => {
        expect.assertions(6);

        const ms = Microservices
            .builder()
            .preRequest((req$) => {
                return req$
                    .map((msg) => {
                        expect(msg.thisMs).toEqual(ms);
                        expect(msg.meta).toEqual(GreetingService.meta);
                        expect(msg.message.data).toEqual(["Idan"]);
                        expect(msg.message.method).toEqual("hello");
                        expect(msg.message.serviceName).toEqual("GreetingService");
                        return msg;
                    });
            })
            .services(new GreetingService(), new GreetingService())
            .build();

        const greetingService = ms
            .proxy()
            .api(GreetingService)
            .create();

        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
    it("postResponse should return data", () => {
        expect.assertions(6);

        const ms = Microservices
            .builder()
            .postResponse((data) => {
                expect(data.inst).toBeDefined();
                expect(data.request.serviceName).toEqual("GreetingService");
                expect(data.response).toBeDefined();
                expect(data.thisMs).toEqual(ms);
                expect(data.meta).toEqual(GreetingService.meta);
            })
            .preRequest((req$) => {
                return req$.map(((msg) => msg));
            })
            .services(new GreetingService(), new GreetingService())
            .build();

        const greetingService = ms
            .proxy()
            .api(GreetingService)
            .create();

        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
    it("postResponse should be trigger after request is done", () => {
        expect.assertions(2);

        let postResponseTriggered = false;

        const ms = Microservices
            .builder()
            .postResponse(() => {
                postResponseTriggered = true;
            })
            .preRequest((req$) => {
                expect(postResponseTriggered).toBe(false);
                return req$.map((msg => msg));
            })
            .services(new GreetingService(), new GreetingService())
            .build();

        const greetingService = ms
            .proxy()
            .api(GreetingService)
            .create();

        return expect(greetingService.hello("Idan")).resolves.toEqual("Hello Idan");
    });
});
