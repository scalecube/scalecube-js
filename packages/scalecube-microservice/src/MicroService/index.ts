import MicroServiceBuilder from './MicroServiceBuilder';

const MicroService = Object.freeze({
  builder: () => {
    return new MicroServiceBuilder();
  },
});

export default {
  MicroService,
};

// MicroService.builder().services().asProxy().contract()
