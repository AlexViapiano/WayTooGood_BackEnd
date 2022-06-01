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
      entities = await strapi.services.diet.search(ctx.query);
    } else {
      entities = await strapi.services.diet.find(ctx.query);
    }

    var diets = entities.map((entity) => {
      const diet = sanitizeEntity(entity, {
        model: strapi.models.diet,
      });
      delete diet.products;
      delete diet.created_by;
      delete diet.updated_by;
      delete diet.createdAt;
      delete diet.updatedAt;
      delete diet.__v;
      delete diet._id;
      return diet;
    });
    return diets;
  },
};
