import { baseEnvironment } from "./environment.base";

export const environment = {
    production: true,
    apiBaseUrl: 'https://gateway.localhost/api/v1/',
    ...baseEnvironment,
};
