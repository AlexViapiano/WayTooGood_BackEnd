"use strict";
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  async createOrder(ctx) {
    const { data } = ctx.request.body;
    const payload = data.object;

    try {
      console.log(
        "----------------------------------------------------------------",
        payload
      );

      const {
        metadata,
        total_details,
        customer_details,
        shipping,
        payment_intent,
      } = payload;
      var { product_qty, name, user, affiliate } = metadata;
      const currency = "CAD";

      var cart = JSON.parse(product_qty);
      var productQty = [];
      var sanitizedCart = [];

      if (cart) {
        await Promise.all(
          cart.map(async (product) => {
            const validatedProduct = await strapi.services.product.findOne({
              id: product.id,
            });
            validatedProduct.qty = product.qty;
            if (validatedProduct) {
              var productImage = "";
              if (
                validatedProduct &&
                validatedProduct.media &&
                validatedProduct.media[0]
              ) {
                var media = validatedProduct.media[0];
                if (
                  media.formats &&
                  media.formats.thumbnail &&
                  media.formats.thumbnail.url
                ) {
                  productImage = media.formats.thumbnail.url;
                }
              }

              productQty.push({
                id: validatedProduct.id,
                name: validatedProduct.name,
                qty: validatedProduct.qty,
                price: validatedProduct.price_CAD.toFixed(2),
                image: productImage,
              });

              sanitizedCart.push(validatedProduct);
            }
          })
        );
      }

      var shipping_fee = 0;
      var discount = 0;
      var taxes = 0;
      if (total_details) {
        shipping_fee = (total_details.amount_shipping / 100).toFixed(2);
        discount = (total_details.amount_discount / 100).toFixed(2);
        taxes = (total_details.amount_tax / 100).toFixed(2);
      }

      var shipping_address = "";

      if (shipping && shipping.address) {
        const { line1, line2, city, state, country, postal_code } =
          shipping.address;

        var line_2 = "";
        if (line2) line_2 = line2 + ", ";

        shipping_address =
          line1 +
          ", " +
          line_2 +
          city +
          ", " +
          state +
          ", " +
          country +
          ", " +
          postal_code;
      }

      if (!name && shipping && shipping.name) name = shipping.name;

      // --------------------------- CREATE ORDER ---------------------------
      const orderEntity = await strapi.services.orders.create({
        payment_intent_id: payload.payment_intent,
        subtotal: (payload.amount_subtotal / 100).toFixed(2),
        shipping_fee: shipping_fee,
        discount: discount,
        taxes: taxes,
        total: (payload.amount_total / 100).toFixed(2),
        product_qty: productQty,
        products: sanitizedCart,

        shipping_address: shipping_address,
        customer_details: customer_details,

        user: user,
        first_name: name,
        email: customer_details.email,
        phone_number: customer_details.phone,
        affiliate: affiliate,
      });
      const order = sanitizeEntity(orderEntity, {
        model: strapi.models.orders,
      });

      var isStaging = "";
      if (
        strapi.config.server.url.includes("stg-api") ||
        strapi.config.server.url.includes("localhost:1337")
      ) {
        isStaging = "STG";
      }

      // --------------------- UPDATE PRODUCT INVENTORIES ----------------------
      sanitizedCart.forEach(async (product) => {
        const updatedProduct = await strapi.services.product.update(
          {
            id: product.id,
          },
          {
            inventory: product.inventory - product.qty,
          }
        );
      });

      // ----------------------- CHECK FOR INFLUENCER AFFILIATE -------------------------
      var influencer;
      if (affiliate) {
        influencer = await strapi.services["influencer"].findOne({
          url: affiliate,
        });

        console.log("influencer", influencer);

        // --------------------------- CREATE INFLUENCER TRANSFER ----------------------------
        if (influencer && influencer.stripe_acct_id) {
          const paymentIntent = await stripe.paymentIntents.retrieve(
            payment_intent
          );

          console.log("paymentIntent", paymentIntent);

          if (
            paymentIntent &&
            paymentIntent.charges &&
            paymentIntent.charges.data
          ) {
            const charge = paymentIntent.charges.data[0];
            const chargeId = charge.id;

            var transfer =
              await strapi.config.functions.order.createInfluencerTransfer(
                order,
                influencer.url,
                influencer.stripe_acct_id,
                influencer.commission,
                currency,
                chargeId,
                isStaging
              );

            console.log("Transfer", transfer);
          }
        }
      }

      ctx.send(
        {
          message: "Success!",
        },
        200
      );
      return ctx;
    } catch (error) {
      console.error(error);
      return { error: error };
    }
  },
  createOrderCheckoutSession: async (ctx) => {
    const { cart, affiliate, isInQCorON } = ctx.request.body;
    const country = "CA";

    const { user } = ctx.state;
    var userId;
    var stripe_customer_id;
    var fullName = "";
    if (user && user.stripe_customer_id)
      stripe_customer_id = user.stripe_customer_id;
    if (user && user.id) userId = user.id;

    if (user && user.first_name) fullName = user.first_name;
    if (user && user.last_name) fullName = fullName + " " + user.last_name;

    let sanitizedCart = [];

    if (cart) {
      await Promise.all(
        cart.map(async (product) => {
          const validatedProduct = await strapi.services.product.findOne({
            id: product.id,
          });
          if (validatedProduct) {
            validatedProduct.qty = product.qty;
            sanitizedCart.push(validatedProduct);
          }
        })
      );
    }

    var line_items = [];

    sanitizedCart.forEach((sanitizedProduct) => {
      let imageUrl = null;
      if (sanitizedProduct.media) {
        var media = sanitizedProduct.media[0];
        if (
          media.formats &&
          media.formats.thumbnail &&
          media.formats.thumbnail.url
        )
          imageUrl = media.formats.thumbnail.url;
        else if (media.url) imageUrl = media.url;
      }

      var tax_code = "txcd_99999999";
      if (sanitizedProduct.tax_exempt) tax_code = "txcd_00000000";

      line_items.push({
        price_data: {
          product_data: {
            name: sanitizedProduct.name,
            images: [imageUrl],
            tax_code: tax_code,
          },
          currency: "cad",
          unit_amount: (sanitizedProduct.price_CAD * 100).toFixed(0),
          tax_behavior: "exclusive",
        },
        quantity: sanitizedProduct.qty,
      });
    });

    const shippingFeeIncluded =
      await strapi.config.functions.cart.shippingFeeIncluded(
        sanitizedCart,
        country
      );

    var shipping_free = {
      display_name: "Free Shipping (Quebec & Ontario)",
      type: "fixed_amount",
      fixed_amount: {
        amount: 0,
        currency: "cad",
      },
      tax_behavior: "exclusive",
      tax_code: "txcd_92010001",
    };

    var shipping_QC_ON = {
      display_name: "Shipping - Quebec & Ontario",
      type: "fixed_amount",
      fixed_amount: {
        amount: 1500,
        currency: "cad",
      },
      tax_behavior: "exclusive",
      tax_code: "txcd_92010001",
    };

    var shipping_rest_of_canada = {
      display_name: "Shipping - Rest of Canada",
      type: "fixed_amount",
      fixed_amount: {
        amount: 2000,
        currency: "cad",
      },
      tax_behavior: "exclusive",
      tax_code: "txcd_92010001",
    };

    var shipping_options = [];

    if (isInQCorON && !shippingFeeIncluded) {
      shipping_options.push(
        {
          shipping_rate_data: shipping_free,
        },
        {
          shipping_rate_data: shipping_rest_of_canada,
        }
      );
    } else if (isInQCorON && shippingFeeIncluded) {
      shipping_options.push(
        {
          shipping_rate_data: shipping_QC_ON,
        },
        {
          shipping_rate_data: shipping_rest_of_canada,
        }
      );
    } else if (!isInQCorON && !shippingFeeIncluded) {
      shipping_options.push(
        {
          shipping_rate_data: shipping_rest_of_canada,
        },
        {
          shipping_rate_data: shipping_free,
        }
      );
    } else {
      shipping_options.push(
        {
          shipping_rate_data: shipping_rest_of_canada,
        },
        {
          shipping_rate_data: shipping_QC_ON,
        }
      );
    }

    var metadata = {
      product_qty: JSON.stringify(cart),
      user: userId,
      name: fullName,
      affiliate: affiliate,
    };

    var urlPrefix = "https://www.waytoogood.com";
    if (
      strapi.config.server.url.includes("localhost:1337") ||
      strapi.config.server.url.includes("stg-api")
    )
      urlPrefix = "https://stg.waytoogood.com";

    var customer_update;
    if (user) {
      customer_update = {
        address: "auto",
        name: "auto",
        shipping: "auto",
      };
    }

    try {
      const session = await stripe.checkout.sessions.create({
        success_url: urlPrefix + "/confirmed",
        cancel_url: urlPrefix + "/cart",
        payment_method_types: ["card"],
        mode: "payment",
        customer: stripe_customer_id,
        line_items: line_items,
        automatic_tax: {
          enabled: true,
        },
        customer_update: customer_update,
        shipping_address_collection: {
          allowed_countries: ["CA"],
        },
        allow_promotion_codes: true,
        shipping_options: shipping_options,
        metadata: metadata,
        // client_reference_id: user.stripe_customer_id,
        tax_id_collection: {
          enabled: true,
        },
        phone_number_collection: {
          enabled: true,
        },
      });
      return session;
    } catch (err) {
      console.log(err);
      return { error: err };
    }
  },
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.orders.search(ctx.query);
    } else {
      entities = await strapi.services.orders.find(ctx.query);
    }

    var orders = entities.map((entity) => {
      const order = sanitizeEntity(entity, {
        model: strapi.models.orders,
      });
      order.user = order.user.id;
      // delete order.products;
      delete order.updatedAt;
      delete order._id;
      delete order.__v;
      return order;
    });
    return orders;
  },
  taxRates: async (ctx) => {
    try {
      const taxRates = await stripe.taxRates.list({
        limit: 20,
        active: true,
      });
      return taxRates;
    } catch (err) {
      return { error: err };
    }
  },
  getPromoCode: async (ctx) => {
    const { code } = ctx.query;
    try {
      var promotionCodes;
      promotionCodes = await stripe.promotionCodes.list({
        code: code,
        active: true,
      });

      var promotionCode = promotionCodes.data[0];
      return promotionCode;
    } catch (err) {
      return { error: err };
    }
  },
  prices: async (ctx) => {
    try {
      const prices = await stripe.prices.list({
        limit: 20,
        active: true,
      });
      return prices;
    } catch (err) {
      return { error: err };
    }
  },
  // createPaymentIntent: async (ctx) => {
  //   const { cart, country, state, code } = ctx.request.body;
  //   const { user } = ctx.state;

  //   // ---------------------- SANITZE & SORT CART -------------------------
  //   var sortedCart = await strapi.config.functions.paymentIntent.sortCart(
  //     cart,
  //     country
  //   );
  //   if (sortedCart.error) {
  //     ctx.response.status = 402;
  //     return sortedCart;
  //   }
  //   const { sanitizedCart, product_qty } = sortedCart;

  //   var promoCode;
  //   if (code != null) {
  //     const promoCodes = await stripe.promotionCodes.list({
  //       code: code,
  //     });
  //     promoCode = promoCodes.data[0];
  //   }

  //   var total = await strapi.config.functions.cart.checkout(
  //     sanitizedCart,
  //     country,
  //     state,
  //     false,
  //     promoCode
  //   );

  //   var currency = await strapi.config.functions.cart.getCurrency(country);

  //   // ------------------- CREATE PAYMENT INTENT -------------------------
  //   try {
  //     if (user && user.stripe_customer_id) {
  //       var paymentIntent = await stripe.paymentIntents.create({
  //         amount: total.toFixed(0),
  //         currency: currency,
  //         metadata: {
  //           cart: JSON.stringify(product_qty).substring(0, 499),
  //           promoCode: code,
  //         },
  //         customer: user.stripe_customer_id,
  //       });
  //     } else {
  //       var paymentIntent = await stripe.paymentIntents.create({
  //         amount: total.toFixed(0),
  //         currency: currency,
  //         metadata: {
  //           cart: JSON.stringify(product_qty).substring(0, 499),
  //           promoCode: code,
  //         },
  //       });
  //     }
  //     return paymentIntent;
  //   } catch (err) {
  //     console.error(err);
  //     return err;
  //   }
  // },
  // create: async (ctx) => {
  //   const {
  //     paymentIntentId,
  //     cart,
  //     shipping_address,
  //     billing_address,
  //     customer_details,
  //     code,
  //     utm,
  //     affiliate,
  //   } = ctx.request.body;
  //   const { user } = ctx.state;
  //   const userId = user ? user.id : null;
  //   try {
  //     var country = shipping_address.shipping_country;
  //     var state = shipping_address.shipping_state;
  //     var currency = await strapi.config.functions.cart.getCurrency(country);

  //     var promoCode;
  //     if (code != null) {
  //       const promoCodes = await stripe.promotionCodes.list({
  //         code: code,
  //       });
  //       promoCode = promoCodes.data[0];
  //     }

  //     // ------------------------ GET PAYMENT INTENT ------------------------
  //     var paymentIntent = await strapi.config.functions.order.getPaymentIntent(
  //       paymentIntentId
  //     );
  //     if (paymentIntent.error) throw paymentIntent;

  //     // -------------------------- GET CHARGE ID ---------------------------
  //     var chargeData = paymentIntent.charges.data[0];
  //     var chargeId = chargeData.id;

  //     // ---------------------- SANITZE & SORT CART -------------------------
  //     var sortedCart = await strapi.config.functions.order.sortCart(
  //       cart,
  //       country
  //     );
  //     if (sortedCart.error) throw sortedCart;

  //     const { product_qty, sanitizedCart, supplierOrders } = sortedCart;

  //     // --------------------------- CREATE ORDER ---------------------------
  //     var order = await strapi.config.functions.order.createOrder(
  //       sanitizedCart,
  //       country,
  //       state,
  //       paymentIntent,
  //       currency,
  //       product_qty,
  //       userId,
  //       shipping_address,
  //       billing_address,
  //       customer_details,
  //       promoCode,
  //       utm,
  //       affiliate
  //     );
  //     if (order.error) return order;

  //     var isStaging = "";
  //     if (
  //       strapi.config.server.url.includes("stg-api") ||
  //       strapi.config.server.url.includes("localhost:1337")
  //     ) {
  //       isStaging = "STG";
  //     }

  //     // ----------------------- CHECK FOR INFLUENCER AFFILIATE -------------------------
  //     var influencer;
  //     if (affiliate) {
  //       influencer = await strapi.services["influencer"].findOne({
  //         url: affiliate,
  //       });

  //       // --------------------------- CREATE INFLUENCER TRANSFER ----------------------------
  //       if (influencer && influencer.stripe_acct_id && chargeId != null) {
  //         var transfer =
  //           await strapi.config.functions.order.createInfluencerTransfer(
  //             order,
  //             influencer.url,
  //             influencer.stripe_acct_id,
  //             influencer.commission,
  //             currency,
  //             chargeId,
  //             isStaging
  //           );
  //       }
  //     }

  //     var purchaseOrders = [];
  //     for (const [key, value] of Object.entries(supplierOrders)) {
  //       const { products, product_qty, supplierEmail } = value;
  //       if (!supplierEmail.includes("waytoogood")) {
  //         var paymentInfo = await strapi.services["payment"].findOne({
  //           supplier_id: key,
  //         });

  //         // ----------------------- CREATE PURCHASE ORDERS -------------------------
  //         var purchaseOrder =
  //           await strapi.config.functions.order.createPurchaseOrder(
  //             products,
  //             country,
  //             state,
  //             paymentIntent,
  //             currency,
  //             product_qty,
  //             userId,
  //             key,
  //             paymentInfo,
  //             shipping_address,
  //             billing_address,
  //             customer_details
  //           );
  //         purchaseOrders.push(purchaseOrder);

  //         // --------------------------- CREATE INVOICE -----------------------------
  //         var invoice = await strapi.config.functions.order.createInvoice(
  //           key,
  //           purchaseOrder,
  //           currency,
  //           paymentInfo
  //         );

  //         if (paymentInfo && paymentInfo.stripe_acct_id && chargeId != null) {
  //           // --------------------------- CREATE SUPPLIER TRANSFER ----------------------------
  //           var transfer = await strapi.config.functions.order.createTransfer(
  //             invoice,
  //             purchaseOrder,
  //             product_qty,
  //             paymentInfo.stripe_acct_id,
  //             order.id,
  //             currency,
  //             supplierEmail,
  //             key,
  //             chargeId,
  //             isStaging
  //           );
  //         }

  //         const updatedOrder = await strapi.services.orders.update(
  //           { id: order.id },
  //           { purchase_orders: purchaseOrders }
  //         );

  //         var invoiceId = 0;
  //         if (invoice && invoice.id) invoiceId = invoice.id;

  //         // ----------------------- SEND EMAIL TO SUPPLIER -----------------------
  //         strapi.config.functions.email.emailSupplierPurchaseOrder(
  //           purchaseOrder.product_qty,
  //           supplierEmail,
  //           shipping_address,
  //           customer_details,
  //           purchaseOrder.id,
  //           invoiceId,
  //           currency,
  //           isStaging
  //         );
  //       }
  //     }

  //     // --------------------- UPDATE PRODUCT INVENTORIES ----------------------
  //     sanitizedCart.forEach(async (product) => {
  //       const updatedProduct = await strapi.services.product.update(
  //         {
  //           id: product.id,
  //         },
  //         {
  //           inventory: product.inventory - product.qty,
  //         }
  //       );
  //     });

  //     // ----------------------- SEND EMAIL TO CUSTOMER -----------------------
  //     strapi.config.functions.email.emailClientOrderDetails(
  //       product_qty,
  //       shipping_address,
  //       customer_details,
  //       order.id,
  //       order.subtotal.toFixed(2),
  //       order.taxes.toFixed(2),
  //       order.shipping_fee.toFixed(2),
  //       order.total.toFixed(2),
  //       currency,
  //       isStaging
  //     );

  //     if (promoCode) {
  //       var previousTimeRedeemed = 0;
  //       if (promoCode.metadata.times_redeemed)
  //         previousTimeRedeemed = parseInt(promoCode.metadata.times_redeemed);
  //       const updatedPromotionCode = await stripe.promotionCodes.update(
  //         promoCode.id,
  //         { metadata: { times_redeemed: previousTimeRedeemed + 1 } }
  //       );
  //     }

  //     return order;
  //   } catch (error) {
  //     console.error(error);

  //     const payment_intent = await stripe.paymentIntents.retrieve(
  //       paymentIntentId
  //     );

  //     const refund = await stripe.refunds.create({
  //       payment_intent: payment_intent.id,
  //       amount: payment_intent.amount,
  //     });

  //     console.error("Payment refunded:" + payment_intent.id);

  //     if (payment_intent.transfer_group) {
  //       const transfers = await stripe.transfers.list({
  //         transfer_group: payment_intent.transfer_group,
  //       });

  //       if (transfers.data && transfers.data.length > 0) {
  //         transfers.data.map(async (transfer) => {
  //           const reversal = await stripe.transfers.createReversal(
  //             transfer.id,
  //             {
  //               amount: transfer.amount,
  //             }
  //           );

  //           console.error("Transfer reversed:" + transfer.id);
  //         });
  //       }
  //     }

  //     ctx.response.status = 400;
  //     return error;
  //   }
  // },
  notifyCustomer: async (ctx) => {
    const { orderId, email, tracking_number } = ctx.query;
    try {
      strapi.config.functions.email.emailNotifyCustomer(
        orderId,
        email,
        tracking_number
      );
      return;
    } catch (err) {
      return { error: err };
    }
  },
};
