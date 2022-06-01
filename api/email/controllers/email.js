"use strict";

const stripe = require("stripe")(process.env.STRIPE_KEY);
const request = require("request");

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async corporateProgram(ctx) {
    const {
      companyName,
      phoneNumber,
      email,
      website,
      description,
      tellUsMore,
    } = ctx.request.body;

    try {
      const send = await strapi.plugins.email.services.email.send({
        to: "support@waytoogood.com",
        from: "",
        template_id: "d-cbe14f75cd03401dbc70f52c68f7c1b8",
        dynamic_template_data: {
          companyName: companyName,
          phoneNumber: phoneNumber,
          email: email,
          website: website,
          description: description,
          tellUsMore: tellUsMore,
        },
      });
      return { sent: true };
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  async becomeSupplier(ctx) {
    const {
      companyName,
      phoneNumber,
      email,
      website,
      description,
      tellUsMore,
    } = ctx.request.body;

    try {
      const send = await strapi.plugins.email.services.email.send({
        to: "support@waytoogood.com",
        from: "",
        template_id: "d-31ff444dfce246d6b6dff261b465bb35",
        dynamic_template_data: {
          companyName: companyName,
          phoneNumber: phoneNumber,
          email: email,
          website: website,
          description: description,
          tellUsMore: tellUsMore,
        },
      });
      return { sent: true };
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  async requestReturn(ctx) {
    const { requestType, product_qty, purchaseOrder, amount, reason, details } =
      ctx.request.body;
    const { user } = ctx.state;

    const emailTemplate = {
      subject: "Client order <%= info.requestType %>",
      text: `Requested <%= info.requestType %>
        Product ID: <%= info.productId %>
        Product Name: <%= info.productName %>
        Product Price (when purchased): $<%= info.productPrice %>
        Amount (to <%= info.requestType %>): <%= info.amount %>
        Reason: <%= info.reason %>
        Details: <%= info.details %>
        Other Useful Info
        UserId: <%= info.userId %>
        Email: <%= info.email %>
        Order #: <%= info.orderId %>
        Purchase Order #: <%= info.purchaseOrderId %>
        Invoice #: <%= info.invoiceId %>
        Supplier ID: <%= info.supplierId %>
        Payment IntentID: <%= info.paymentIntentId %>

        `,
      html: `<h2>Requested <%= info.requestType %></h2>
        <p>Product ID: <%= info.productId %></p>
        <p>Product Name: <%= info.productName %></p>
        <p>Product Price (when purchased): $<%= info.productPrice %></p>
        <p>Amount (to <%= info.requestType %>): <%= info.amount %></p>
        <p>Reason: <%= info.reason %></p>
        <p>Details: <%= info.details %></p>
        <h2>Other Useful Info</h2>
        <p>UserId: <%= info.userId %></p>
        <p>Email: <%= info.email %></p>
        <p>Order #: <%= info.orderId %></p>
        <p>Purchase Order #: <%= info.purchaseOrderId %></p>
        <p>Invoice #: <%= info.invoiceId %></p>
        <p>Supplier ID: <%= info.supplierId %></p>
        <p>Payment IntentID: <%= info.paymentIntentId %></p>
        `,
    };

    try {
      const send = await strapi.plugins.email.services.email.send({
        to: "support@waytoogood.com",
        from: "",
        template_id: "d-909524e147f74d4cb3778db51fc20dd4",
        dynamic_template_data: {
          requestType: requestType,
          productId: product_qty.id,
          productName: product_qty.name,
          productPrice: product_qty.price,
          amount: amount,
          reason: reason,
          details: details,
          userId: user.id,
          email: user.email,
          orderId: purchaseOrder.order,
          purchaseOrderId: purchaseOrder.id,
          invoiceId: purchaseOrder.invoice,
          supplierId: purchaseOrder.supplier_id,
          paymentIntentId: purchaseOrder.payment_intent_id,
        },
      });
      return { sent: true };
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  async contactUs(ctx) {
    const { name, email, message, phone } = ctx.request.body;
    try {
      const send = await strapi.plugins.email.services.email.send({
        to: "support@waytoogood.com",
        from: "",
        template_id: "d-b4d0f9cea3a046e3982376db99a96abe",
        dynamic_template_data: {
          name: name,
          email: email,
          message: message,
          phone: phone,
        },
      });

      return { sent: true };
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  async confirmSubscribe(ctx) {
    const { data } = ctx.request.body;
    const payload = data.object;
    const { metadata, latest_invoice } = payload;
    var { affiliate } = metadata;
    console.log(payload);

    try {
      if (payload) {
        const stripeCustomer = await stripe.customers.retrieve(
          payload.customer
        );
        const metadata = payload.metadata;
        const { line1, line2, city, country, state, postal_code } = metadata;

        var address = "";
        if (line1 && line2 && city && country && state && postal_code) {
          address =
            "Address: " +
            metadata.line1 +
            ", " +
            metadata.line2 +
            ", " +
            metadata.city +
            ", " +
            metadata.country +
            ", " +
            metadata.state +
            ", " +
            metadata.postal_code;
        } else if (line1 && city && country && state && postal_code) {
          address =
            "Address: " +
            metadata.line1 +
            ", " +
            metadata.city +
            ", " +
            metadata.country +
            ", " +
            metadata.state +
            ", " +
            metadata.postal_code;
        }

        const { id, plan, quantity } = payload;
        const idShort = "Subscription: " + id.slice(-5);
        var planString = "";
        if (plan && plan.amount && plan.interval) {
          planString =
            "Plan: " + (plan.amount / 100).toFixed(2) + "$ / " + plan.interval;
        }
        const qty = "Quantity: " + quantity.toString();

        var name = "";
        if (metadata.name) name = metadata.name;
        var diet = "";
        if (metadata.diet) diet = "Diet: " + metadata.diet;
        var giftTo = "";
        if (metadata.gift_to) diet = "Gifted To: " + metadata.gift_to;

        const send = await strapi.plugins.email.services.email.send({
          to: stripeCustomer.email,
          from: "",
          template_id: "d-08584472cbac4f6c8dca7832f615e08f",
          dynamic_template_data: {
            id: idShort,
            plan: planString,
            name: name,
            address: address,
            diet: diet,
            quantity: qty,
            giftTo: giftTo,
          },
        });

        var options = {
          method: "PUT",
          url: "https://api.sendgrid.com/v3/marketing/contacts",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
          body: {
            list_ids: ["a4b111d3-7464-42a2-9ec7-f7800f038f9b"],
            contacts: [
              {
                email: stripeCustomer.email,
                first_name: name,
              },
            ],
          },
          json: true,
        };
        var res = await request(options, function (error) {
          if (error) throw new Error(error);
        });

        // ----------------------- CHECK FOR INFLUENCER AFFILIATE -------------------------
        var influencer;
        if (affiliate) {
          influencer = await strapi.services["influencer"].findOne({
            url: affiliate,
          });

          console.log("-------------------1--------------------");
          console.log("influencer", influencer);

          // --------------------------- CREATE INFLUENCER TRANSFER ----------------------------
          if (influencer && influencer.stripe_acct_id && latest_invoice) {
            console.log("------------------2--------------------");
            console.log("latest_invoice", latest_invoice);
            const invoice = await stripe.invoices.retrieve(latest_invoice);

            console.log("------------------3---------------------");
            console.log("invoice", invoice);

            var order = {
              id: invoice.id,
              subtotal: (invoice.amount_paid / 100).toFixed(0),
            };

            if (invoice && invoice.charge) {
              var transfer =
                await strapi.config.functions.order.createInfluencerTransfer(
                  order,
                  influencer.url,
                  influencer.stripe_acct_id,
                  influencer.commission,
                  "cad",
                  invoice.charge,
                  null
                );

              console.log("-------------------4--------------------");
              console.log("Transfer", transfer);
            }
          }
        }

        return res;
      }
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  async cancelSubscribe(ctx) {
    const { data } = ctx.request.body;
    const payload = data.object;

    try {
      if (payload) {
        const stripeCustomer = await stripe.customers.retrieve(
          payload.customer
        );
        const metadata = payload.metadata;
        const { id, plan, quantity } = payload;
        const idShort = "Subscription: " + id.slice(-5);
        var planString = "";
        if (plan && plan.amount && plan.interval) {
          planString =
            "Plan: " + (plan.amount / 100).toFixed(2) + "$ / " + plan.interval;
        }
        const qty = "Quantity: " + quantity.toString();

        var name = "";
        if (metadata.name) name = metadata.name;
        var diet = "";
        if (metadata.diet) diet = "Diet: " + metadata.diet;
        var giftTo = "";
        if (metadata.gift_to) diet = "Gifted To: " + metadata.gift_to;

        const send = await strapi.plugins.email.services.email.send({
          to: stripeCustomer.email,
          from: "",
          template_id: "d-94b92ab7f3d3498684e43f18f012f7e6",
          dynamic_template_data: {
            id: idShort,
            plan: planString,
            name: name,
            diet: diet,
            quantity: qty,
            giftTo: giftTo,
          },
        });

        return send;
      }
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
};
