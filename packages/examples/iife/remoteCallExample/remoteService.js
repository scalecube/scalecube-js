/**
 * Remote service.
 * The service can be written and re-written in every available technology.
 * it can be run in workers, browser or server.
 * Scalecube provide us a way to publish the service from any platform.
 * In this example we will create the service and use it by other microservice instance.
 */

window.addEventListener('DOMContentLoaded', function(event) {
  (function(createMicroservice, ASYNC_MODEL_TYPES, rxjs, remoteServiceDefinition) {
    var remoteService = {
      hello: function(name) {
        return new Promise(function(resolve, reject) {
          if (!name) {
            reject(new Error('please provide user to greet'));
          } else {
            resolve('Hello ' + name);
          }
        });
      },

      greet$: function(greetings) {
        return new rxjs.Observable(function(observer) {
          if (!greetings || !Array.isArray(greetings) || greetings.length === 0) {
            observer.error(new Error('please provide Array of greetings'));
          }
          for (var i = 0; i < greetings.length; i++) {
            observer.next('greetings ' + greetings[i]);
          }
        });
      },
    };

    /**
     * the remote service will be available only after 2s
     */
    setTimeout(function() {
      console.log('bootstrap remote microservice after 2s');
      createMicroservice({
        services: [
          {
            definition: remoteServiceDefinition,
            reference: remoteService,
          },
        ],
        address: 'seed',
      });
    }, 2000);
  })(window.sc.createMicroservice, window.sc.ASYNC_MODEL_TYPES, rxjs, definitions);
});
