"use strict";
const stripe = require("stripe")(process.env.STRIPE_KEY);
const request = require("request");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  me: async (ctx) => {
    const { user } = ctx.state;
    const foundUser = await strapi
      .query("user", "users-permissions")
      .findOne({ id: user.id });
    delete foundUser.updated_by;
    delete foundUser.created_by;
    delete foundUser.createdAt;
    delete foundUser.updatedAt;
    delete foundUser.__v;
    delete foundUser._id;
    delete foundUser.provider;
    delete foundUser.password;
    delete foundUser.blocked;
    delete foundUser.role;
    delete foundUser.review;
    delete foundUser.orders;

    var products = foundUser.products.map((product) => {
      return {
        name: product.name,
        media: product.media,
        id: product.id,
        url: product.url,
      };
    });

    foundUser.products = products;

    return foundUser;
  },
  updateUser: async (ctx) => {
    const update = ctx.request.body;
    const { user } = ctx.state;

    const updatedUser = await strapi
      .query("user", "users-permissions")
      .update({ id: user.id }, update);

    return updatedUser;
  },
  getStripeCustomer: async (ctx) => {
    const { user } = ctx.state;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (customer.deleted == true) {
        const newCustomer = await stripe.customers.create({
          email: user.email,
        });
        const updatedUser = await strapi
          .query("user", "users-permissions")
          .update({ id: user.id }, { stripe_customer_id: newCustomer.id });
      } else return customer;
    } catch (err) {
      if (err.code == "resource_missing" || !stripeCustomerId) {
        // If Stripe customer is missing... create a new one
        const customer = await stripe.customers.create({
          email: user.email,
        });
        const updatedUser = await strapi
          .query("user", "users-permissions")
          .update({ id: user.id }, { stripe_customer_id: customer.id });
        return customer;
      } else return { error: err };
    }
  },
  createStripeCustomer: async (ctx) => {
    const { user } = ctx.state;
    var name = "";
    name = user.first_name + " " + user.last_name;
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: name,
      });
      const updatedUser = await strapi
        .query("user", "users-permissions")
        .update({ id: user.id }, { stripe_customer_id: customer.id });
      return customer;
    } catch (err) {
      return { error: err };
    }
  },
  updateStripeCustomer: async (ctx) => {
    const { user } = ctx.state;
    const update = ctx.request.body;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      const customer = await stripe.customers.update(stripeCustomerId, update);
      return customer;
    } catch (err) {
      return { error: err };
    }
  },
  getSubscriptions: async (ctx) => {
    const { user } = ctx.state;

    const stripeCustomerId = user.stripe_customer_id;
    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        // status: "active",
      });

      return subscriptions.data;
    } catch (err) {
      return { error: err };
    }
  },
  updateSubscription: async (ctx) => {
    const { user } = ctx.state;
    const { subscriptionId } = ctx.params;

    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        metadata: ctx.request.body,
      });
      return subscription;
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  },
  subscribe: async (ctx) => {
    const { price } = ctx.request.body;
    const { user } = ctx.state;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: price }],
      });
      return subscription;
    } catch (err) {
      return { error: err };
    }
  },
  createCheckoutSession: async (ctx) => {
    const {
      return_url,
      cancel_url,
      price,
      metadata,
      tax_rates,
      quantity,
      affiliate,
    } = ctx.request.body;
    const { user } = ctx.state;

    var metadataAffiliate = {
      affiliate: affiliate,
    };

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: return_url,
        cancel_url: cancel_url,
        payment_method_types: ["card"],
        line_items: [
          {
            quantity: quantity,
            price: price,
            tax_rates: tax_rates,
            adjustable_quantity: {
              enabled: true,
            },
          },
        ],
        mode: "subscription",
        customer: user.stripe_customer_id,
        // billing_address_collection: "required",
        allow_promotion_codes: true,
        subscription_data: {
          metadata: metadata,
        },
        metadata: metadataAffiliate,
      });
      return session;
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  },
  createBillingPortalSession: async (ctx) => {
    const { return_url } = ctx.request.body;
    const { user } = ctx.state;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      var session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: return_url,
      });
      return session;
    } catch (err) {
      return { error: err };
    }
  },
  getCustomerCards: async (ctx) => {
    const { user } = ctx.state;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      const cards = await stripe.customers.listSources(stripeCustomerId, {
        object: "card",
        limit: 3,
      });
      return cards;
    } catch (err) {
      return { error: err };
    }
  },
  getPaymentMethods: async (ctx) => {
    const { user } = ctx.state;
    const stripeCustomerId = user.stripe_customer_id;
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
      });
      return paymentMethods;
    } catch (err) {
      return { error: err };
    }
  },
  createSendGridContact: async (ctx) => {
    const { email, first_name, last_name } = ctx.request.body;
    var options = {
      method: "PUT",
      url: "https://api.sendgrid.com/v3/marketing/contacts",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: {
        list_ids: ["d3c57d0a-2ecb-47ec-a0ae-dc55bed85974"],
        contacts: [
          {
            email: email,
            first_name: first_name,
            last_name: last_name,
          },
        ],
      },
      json: true,
    };
    var res = await request(options, function (error) {
      if (error) throw new Error(error);
    });
    return res;
  },
};
