"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findOne(ctx) {
    const { url } = ctx.params;
    const entity = await strapi.services.influencer.findOne({
      url: url,
      _locale: "all",
    });
    return sanitizeEntity(entity, { model: strapi.models.influencer });
  },
};
