import { baseEnvironment } from './environment.base';

export const environment = {
  production: true,
  // apiBaseUrl: 'http://api.ussd365.com/api/v1/', // Use Docker service name
  apiBaseUrl: 'https://gateway.ussd365.com/api/v1/', // Use Docker service name
  ...baseEnvironment
};
