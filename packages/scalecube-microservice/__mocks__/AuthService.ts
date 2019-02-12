import { generateUUID } from '../src/helpers/utils';

class AuthService {
  public auth(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

const authServiceMeta = {
  serviceName: 'AuthService',
  methods: {
    auth: {
      asyncModel: 'Promise',
    },
  },
};

const authServiceInstance = new AuthService();

authServiceInstance.constructor = authServiceInstance.constructor || {};
// tslint:disable-next-line
authServiceInstance.constructor['meta'] = {
  identifier: `${generateUUID()}`,
  ...authServiceMeta,
};

export { authServiceInstance, authServiceMeta };
