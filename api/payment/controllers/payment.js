"use strict";
const stripe = require("stripe")(process.env.STRIPE_KEY);

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  getStripeLink: async (ctx) => {
    try {
      const { id } = ctx.params;
      const link = await stripe.accounts.createLoginLink(id);
      return link.url;
    } catch (err) {
      return { error: err };
    }
  },
};
