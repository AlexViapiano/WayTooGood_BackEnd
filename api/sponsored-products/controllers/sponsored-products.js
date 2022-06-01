"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services["sponsored-products"].search(ctx.query);
    } else {
      entities = await strapi.services["sponsored-products"].find(ctx.query);
    }
    return entities;
  },
};
