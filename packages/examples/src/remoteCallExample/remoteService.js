/**
 * Remote service.
 * The service can be written and re-written in every available technology.
 * it can be run in workers, browser or server.
 * Scalecube provide us a way to publish the service from any platform.
 *
 * In this example we will create the service and use it by other microservice instance.
 */

window.addEventListener('DOMContentLoaded', (event) => {
  (function(Microservices, ASYNC_MODEL_TYPES, rxjs, utils, definitions) {
    var remoteService = {
      hello: function(name) {
        return new Promise((resolve, reject) => {
          if (!name) {
            reject(new Error('please provide user to greet'));
          } else {
            resolve(`Hello ${name}`);
          }
        });
      },

      greet$: function(greetings) {
        return new rxjs.Observable((observer) => {
          if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
            observer.error(new Error('please provide Array of greetings'));
          }
          greetings.map((i) => observer.next(`greetings ${i}`));
        });
      },
    };

    /**
     * the remote service will be available only after 2s
     */
    setTimeout(() => {
      console.log('provision remote microservice after 2s');
      Microservices.create({
        services: [
          {
            definition: definitions.remoteServiceDefinition,
            reference: remoteService,
          },
        ],
        seedAddress: utils.generateAddress(8000),
        address: utils.generateAddress(1234),
      });
    }, 2000);
  })(window.sc.Microservices, window.sc.ASYNC_MODEL_TYPES, rxjs, utils, definitions);
});
