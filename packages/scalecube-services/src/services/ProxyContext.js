// @flow
import {Observable, pipe} from 'rxjs/Rx';

import 'rxjs/add/operator/switchMap';
import 'rxjs/operator/toPromise';
import 'rxjs/add/observable/fromPromise';
import {Router, RoundRobinServiceRouter, Microservices, ServiceDefinition} from ".";
import type {Message} from ".";

const getHandler = ({dispatcher, meta, microservices}) =>
    (target, prop) => {
        if (meta.methods[prop] === undefined) {
            return undefined;
        }
        const type = meta.methods[prop].type;
        return (...args) => {
            const message = {
                serviceName: meta.serviceName,
                method: prop,
                data: args
            };
            if (meta.methods[prop].type !== "Promise" &&
                meta.methods[prop].type !== "Observable") {
                return Error(`service method unknown type error: ${meta.serviceName}.${prop}`);
            }

            const chain$ = Observable
                .from([{
                    message,
                    serviceDefinition: meta,
                    thisMs: microservices
                }])
                .switchMap(req => type === "Promise" ?
                    Observable.from(dispatcher.invoke(req.message)) :
                    dispatcher.listen(req.message)
                );

            return type === "Promise" ? chain$.toPromise() : chain$;
        };
    };

export class ProxyContext {
    myapi: any;
    router: typeof Router;
    microservices: Microservices;

    constructor(microservices: Microservices) {
        this.microservices = microservices;
        this.router = RoundRobinServiceRouter;
    }

    /**
     *
     * @param api
     *
     * @param router
     * @return {api}
     */
    createProxy(api: any, router: typeof Router) {
        const dispatcher = this.microservices.dispatcher().router(router).create();
        const meta = api.meta;
        const microservices = this.microservices;

        if (!meta) {
            return Error("API must have meta property");
        }

        meta.serviceName = meta.serviceName || meta.name || api.name;
        if (!meta.serviceName) {
            return Error("service name (api.meta.serviceName) is not defined");
        }
        if (!meta.methods) {
            return Error("meta.methods is not defined");
        }
        return new Proxy({}, {
            get: getHandler({dispatcher, meta, microservices})
        });
    }

    create() {
        return this.createProxy(this.myapi, this.router);
    }

    api(api: any) {
        this.myapi = api;
        return this;
    }
}
