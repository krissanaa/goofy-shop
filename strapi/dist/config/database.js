"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const sslConfig = (env) => {
    if (!env.bool('DATABASE_SSL', false)) {
        return false;
    }
    return {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
    };
};
exports.default = ({ env }) => {
    var _a;
    const client = env('DATABASE_CLIENT', 'postgres');
    const connections = {
        mysql: {
            connection: {
                host: env('DATABASE_HOST', 'localhost'),
                port: env.int('DATABASE_PORT', 3306),
                database: env('DATABASE_NAME', 'goofy_shop'),
                user: env('DATABASE_USERNAME', 'strapi'),
                password: env('DATABASE_PASSWORD', 'strapi'),
                ssl: sslConfig(env),
            },
            pool: { min: 2, max: 10 },
        },
        postgres: {
            connection: {
                connectionString: env('DATABASE_URL'),
                host: env('DATABASE_HOST', 'localhost'),
                port: env.int('DATABASE_PORT', 5432),
                database: env('DATABASE_NAME', 'goofy_shop'),
                user: env('DATABASE_USERNAME', 'postgres'),
                password: env('DATABASE_PASSWORD', 'postgres'),
                ssl: sslConfig(env),
                schema: env('DATABASE_SCHEMA', 'public'),
            },
            pool: { min: 2, max: 10 },
        },
        sqlite: {
            connection: {
                filename: path_1.default.join(__dirname, '..', env('DATABASE_FILENAME', '.tmp/data.db')),
            },
            useNullAsDefault: true,
        },
    };
    return {
        connection: {
            client,
            ...((_a = connections[client]) !== null && _a !== void 0 ? _a : connections.sqlite),
            acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
        },
    };
};
