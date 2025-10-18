import { baseEnvironment } from "./environment.base";

export const environment = {
    production: true,
    apiBaseUrl: 'https://gateway.ussd365.com/api/v1/',
    ...baseEnvironment,
};
