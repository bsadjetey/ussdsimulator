import { baseEnvironment } from "./environment.base";

export const environment = {
    production: true,
    // apiBaseUrl: 'https://gateway.localhost/api/v1/',
    apiBaseUrl: 'http://127.0.0.1:8000/api/v1/',
    ...baseEnvironment,
};
