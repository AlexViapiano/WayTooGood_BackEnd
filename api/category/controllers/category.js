"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.category.search(ctx.query);
    } else {
      entities = await strapi.services.category.find(ctx.query);
    }

    var categories = entities.map((entity) => {
      const category = sanitizeEntity(entity, {
        model: strapi.models.category,
      });
      delete category.products;
      delete category.created_by;
      delete category.updated_by;
      delete category.createdAt;
      delete category.updatedAt;
      delete category.__v;
      delete category._id;
      return category;
    });
    return categories;
  },
};
