import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::drop-event.drop-event', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
  },
});
