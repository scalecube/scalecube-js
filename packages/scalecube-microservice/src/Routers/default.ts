import { Router } from '../api/public';

export const defaultRouter: Router = Object.freeze({
  route: ({ message, lookUp }) => {
    const { qualifier } = message;
    const endpoints = lookUp({ qualifier });
    if (!(endpoints && Array.isArray(endpoints) && endpoints.length > 0)) {
      return null;
    } else {
      return endpoints[0];
    }
  },
} as Router);
