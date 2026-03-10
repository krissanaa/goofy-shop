import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::global-config.global-config', {
  config: {
    find: {
      auth: false,
    },
  },
});
