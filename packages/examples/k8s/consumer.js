const { createMicroservice, ASYNC_MODEL_TYPES } = require('@scalecube/node');
const http = require('http');
const url = require('url');

console.log('seed', process.env.SEED);
console.log('address', process.env.ADDRESS);

const definition = {
  serviceName: 'HelloService',
  methods: {
    hello: {
      asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
    },
  },
};

const proxy = createMicroservice({
  seedAddress: {
    protocol: 'ws',
    host: process.env.SEED,
    port: 8080,
    path: '',
  },
  address: {
    protocol: 'ws',
    host: process.env.ADDRESS,
    port: 8080,
    path: '',
  },
  debug: true,
}).createProxy({
  serviceDefinition: definition,
});

// setInterval(() => {
//   proxy
//     .hello('test')
//     .then(console.log)
//     .catch(console.error);
// }, 10000);

//create a server object:
http
  .createServer(function(req, res) {
    console.log('got req: ', req.url);
    var q = url.parse(req.url, true).query;
    proxy
      .hello({ name: q.name })
      .then((r) => {
        console.log(r);
        res.write(JSON.stringify(r)); //write a response to the client
        res.end(); //end the response
      })
      .catch((e) => {
        console.log(res);
        res.write(JSON.stringify(e)); //write a response to the client
        res.end(); //end the response
      });
  })
  .listen(80); //the server object listens on port 8080
