import { baseEnvironment } from './environment.base';

export const environment = {
  production: true,
  apiBaseUrl: 'http://gateway.localhost/api/v1/', // Use Docker service name
  ...baseEnvironment
};
