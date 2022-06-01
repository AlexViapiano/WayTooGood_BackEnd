"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/v3.x/concepts/configurations.html#cron-tasks
 */

module.exports = {
  "0 0 12 * * *": async () => {
    console.log("🚀 ~ cron.js ~ Every day at noon");

    var abondonedCarts = await strapi.services["checkout-session"].find({
      email_null: false,
      email_sent_null: true,
      complete_null: true,
    });

    const today = new Date();
    abondonedCarts.forEach(async (abondonedCart) => {
      if (
        abondonedCart.created_at.getDate() == today.getDate() &&
        abondonedCart.created_at.getMonth() == today.getMonth() &&
        abondonedCart.created_at.getFullYear() == today.getFullYear()
      ) {
        strapi.config.functions.email.emailClientAbondonedCart(
          abondonedCart.email,
          abondonedCart.cart
        );

        await strapi.services["checkout-session"].update(
          { id: abondonedCart.id },
          {
            email_sent: true,
          }
        );
      }
    });
  },
};
