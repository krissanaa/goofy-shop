"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreRouter('api::drop-event.drop-event', {
    config: {
        find: {
            auth: false,
        },
        findOne: {
            auth: false,
        },
    },
});
