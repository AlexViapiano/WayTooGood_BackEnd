"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findOne(ctx) {
    const { url } = ctx.params;
    const entity = await strapi.services.brand.findOne({
      url: url,
      _locale: "all",
    });
    return sanitizeEntity(entity, { model: strapi.models.brand });
  },
};
