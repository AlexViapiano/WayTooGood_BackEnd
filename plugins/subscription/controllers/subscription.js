"use strict";
const stripe = require("stripe")(process.env.STRIPE_KEY);

/**
 * subscription.js controller
 *
 * @description: A set of functions called "actions" of the `subscription` plugin.
 */

module.exports = {
  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {
    ctx.send({
      message: "ok",
    });
  },
  async getSubscriptions(ctx) {
    const { user } = ctx.state;
    const { starting_after } = ctx.params;

    // HOW DO I GET THE COUNT?
    // const count = await stripe.subscriptions.list({
    //   limit: 0,
    //   include: "total_count",
    // });
    // "https://dashboard.stripe.com/v1/subscriptions?count_limit=50000&include%5B%5D=total_count&limit=0"

    if (
      user &&
      user.roles.filter((role) => role.id === 1 || role.id === 5).length > 0
    ) {
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        starting_after: starting_after,
      });

      return subscriptions;
    } else {
      return ctx.unauthorized("Only admis allowed!");
    }
  },
  async getCancelled(ctx) {
    const { user } = ctx.state;
    const { starting_after } = ctx.params;

    if (
      user &&
      user.roles.filter((role) => role.id === 1 || role.id === 5).length > 0
    ) {
      const cancelled = await stripe.subscriptions.list({
        limit: 100,
        status: "canceled",
        starting_after: starting_after,
      });
      return cancelled;
    } else {
      return ctx.unauthorized("Only admis allowed!");
    }
  },
};
