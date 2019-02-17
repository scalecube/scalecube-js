import HtmlService from '../__mocks__/HtmlService';
import { MicroService } from '../src/Microservices';
import { defaultRouter } from '../src/Routers/default';

describe('htmlService', () => {
  it('Import HTMLElement with htmlService and render it', (done) => {
    const htmlServiceMeta = {
      serviceName: 'HtmlService',
      methods: {
        render: {
          asyncModel: 'Promise',
        },
      },
    };

    const htmlServiceInstance = new HtmlService();
    (htmlServiceInstance as any).constructor = htmlServiceInstance.constructor || {};
    (htmlServiceInstance.constructor as any).meta = htmlServiceMeta;

    const ms = MicroService.create({
      services: [htmlServiceInstance],
    });

    const htmlService = ms.asProxy({
      serviceContract: htmlServiceMeta,
      router: defaultRouter,
    });

    htmlService.render().then((response) => {
      const htmlProduct = Object.create(response.default.prototype, {});
      expect(htmlProduct.render()).toEqual('<h3>HTML Service</h3>');
      done();
    });
  });
});
