const { retryRouter } = require('@scalecube/routers');

const retryRouterWithLogs = (serviceName) => (...data) =>
  new Promise((resolve) => {
    const progress = setInterval(() => {
      console.log(`${serviceName} waiting...`);
    }, 1000);

    retryRouter({ period: 10 })(...data).then((response) => {
      clearInterval(progress);
      resolve(response);
    });
  });

module.exports = {
  retryRouterWithLogs,
};
