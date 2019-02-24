import HtmlService from '../__mocks__/HtmlService';
import { Microservices } from '../src/Microservices/Microservices';
import { defaultRouter } from '../src/Routers/default';
import { asyncModelTypes } from '../src/helpers/utils';

describe('htmlService', () => {
  it('Import HTMLElement with htmlService and render it', (done) => {
    const htmlServiceDefinition = {
      serviceName: 'HtmlService',
      methods: {
        render: {
          asyncModel: asyncModelTypes.promise,
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
