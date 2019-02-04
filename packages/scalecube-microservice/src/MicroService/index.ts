import MicroServiceBuilder from './MicroServiceBuilder';

const MicroService = Object.freeze({
  Builder: () => {
    return new MicroServiceBuilder();
  },
});

export default {
  MicroService,
};

//MicroService.Builder().done()
