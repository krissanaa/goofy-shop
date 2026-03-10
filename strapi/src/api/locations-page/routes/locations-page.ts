import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::locations-page.locations-page', {
  config: {
    find: {
      auth: false,
    },
  },
});
