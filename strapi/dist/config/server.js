"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
        keys: env.array('APP_KEYS', ['goofy-key-1', 'goofy-key-2', 'goofy-key-3', 'goofy-key-4']),
    },
    webhooks: {
        populateRelations: false,
    },
});
