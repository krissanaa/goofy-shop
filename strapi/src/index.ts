const publicReadActions = [
  'api::product.product.find',
  'api::product.product.findOne',
  'api::category.category.find',
  'api::category.category.findOne',
  'api::drop-event.drop-event.find',
  'api::drop-event.drop-event.findOne',
  'api::global-config.global-config.find',
  'api::home-page.home-page.find',
  'api::products-page.products-page.find',
  'api::locations-page.locations-page.find',
];

type PermissionEntry = {
  id: number;
  action: string;
};

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: any }) {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (!publicRole) {
      strapi.log.warn('Public role not found. Skipping permission bootstrap for Goofy Shop APIs.');
      return;
    }

    const existingPermissions = (await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
        action: { $in: publicReadActions },
      },
      select: ['id', 'action'],
    })) as PermissionEntry[];

    for (const action of publicReadActions) {
      const entry = existingPermissions.find((permission) => permission.action === action);

      if (!entry) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: publicRole.id,
          },
        });
      }
    }

    strapi.log.info('Public read permissions enforced for Product, Category, Drop Event, Global Config, Home Page, Products Page, and Locations Page APIs.');
  },
};
