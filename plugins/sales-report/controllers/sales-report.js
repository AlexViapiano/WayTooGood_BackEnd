"use strict";
const { sanitizeEntity } = require("strapi-utils");

/**
 * sales-report.js controller
 *
 * @description: A set of functions called "actions" of the `sales-report` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    // Add your own logic here.

    // Send 200 `ok`
    ctx.send({
      message: "ok",
    });
  },
  async getOrders(ctx) {
    const { user } = ctx.state;

    if (
      user &&
      user.roles.filter((role) => role.id === 1 || role.id === 5).length > 0
    ) {
      let entities;
      if (ctx.query._q) {
        entities = await strapi.services.orders.search(ctx.query);
      } else {
        entities = await strapi.services.orders.find(ctx.query);
      }

      var orders = entities.map((entity) => {
        // const order = sanitizeEntity(entity, {
        //   model: strapi.models.orders,
        // });
        var order = {
          id: entity.id,
          name: entity.name,
          product_qty: entity.product_qty,
          notes: entity.notes,
          created_at: entity.created_at,
        };
        return order;
      });
      return orders;
    } else return [];
  },
};
