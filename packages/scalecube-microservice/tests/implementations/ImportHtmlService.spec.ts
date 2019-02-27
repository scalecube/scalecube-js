import HtmlService from '../mocks/HtmlService';
import { Microservices } from '../../src/Microservices/Microservices';
import { defaultRouter } from '../../src/Routers/default';
import { ASYNC_MODEL_TYPES } from '../../src/helpers/constants';

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
      expect(htmlProduct.render()).toEqual('<h3>HTML Service</h3>');
      done();
    });
  });
});
