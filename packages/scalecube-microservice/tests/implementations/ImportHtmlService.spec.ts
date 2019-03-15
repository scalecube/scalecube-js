import HtmlService from '../mocks/HtmlService';
import { Microservices, ASYNC_MODEL_TYPES } from '../../src/index';
import { defaultRouter } from '../../src/Routers/default';

describe('htmlService', () => {
  it('Import HTMLElement with htmlService and render it', (done) => {
    const htmlServiceDefinition = {
      serviceName: 'HtmlService',
      methods: {
        render: {
          asyncModel: ASYNC_MODEL_TYPES.REQUEST_RESPONSE,
        },
      },
    };

    const ms = Microservices.create({
      services: [{ definition: htmlServiceDefinition, reference: new HtmlService() }],
    });

    const htmlServiceProxy = ms.createProxy({
      serviceDefinition: htmlServiceDefinition,
      router: defaultRouter,
    });

    htmlServiceProxy.render().then((response: { default: any }) => {
      const htmlProduct = Object.create(response.default.prototype, {});
      expect(htmlProduct.render()).toEqual('<h3>HTML Service title</h3>');
      done();
    });
  });
});
