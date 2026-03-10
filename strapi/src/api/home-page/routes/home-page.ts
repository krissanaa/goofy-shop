import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::home-page.home-page', {
  config: {
    find: {
      auth: false,
    },
  },
});
