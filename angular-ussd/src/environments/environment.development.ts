import { baseEnvironment } from "./environment.base";

export const environment = {
    production: false,
    // apiBaseUrl: 'http://api.ussd.localhost/api/v1/', // Use Docker service name
    apiBaseUrl: 'http://localhost:8000/api/v1/',
    ...baseEnvironment,
};
