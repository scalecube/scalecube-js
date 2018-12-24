import GreetingService from "../../../../examples/GreetingServiceClass/GreetingService.js";
import { Microservices } from "../../src/services";
import { isObservable } from "../../src/services/utils";

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

    it("postResponse should change message", () => {
        expect.assertions(6);

        const ms = Microservices
            .builder()
            .postResponse((response, data) => {
                data.request.data.push("Igor");
                expect(isObservable(response)).toBeTruthy();
                expect(data.inst).toBeDefined();
                expect(data.request.serviceName).toEqual("GreetingService");
                expect(data.thisMs).toEqual(ms);
                expect(data.meta).toEqual(GreetingService.meta);
                return response;
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

        return expect(greetingService.hello()).resolves.toEqual("Hello Igor");
    });

    it("postResponse should be trigger after request is done", () => {
        expect.assertions(2);

        let postResponseTriggered = false;

        const ms = Microservices
            .builder()
            .postResponse((response) => {
                postResponseTriggered = true;
                return response;
            })
            .preRequest((req$) => {
                expect(postResponseTriggered).toBe(false);
                return req$.map((msg) => msg);
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
