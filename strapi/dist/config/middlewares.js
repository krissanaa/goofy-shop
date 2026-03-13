"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = [
    'strapi::logger',
    'strapi::errors',
    'strapi::security',
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    {
        name: 'strapi::favicon',
        config: {
            path: 'public/favicon.svg',
            maxAge: 86400000,
        },
    },
    'strapi::public',
];
