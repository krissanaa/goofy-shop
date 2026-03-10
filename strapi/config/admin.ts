type EnvTools = {
  (key: string, defaultValue?: string): string;
};

export default ({ env }: { env: EnvTools }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'goofy-admin-jwt-secret'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'goofy-api-token-salt'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'goofy-transfer-token-salt'),
    },
  },
});
