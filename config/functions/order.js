var SalesTax = require("sales-tax");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  getPaymentIntent: async (paymentIntentId) => {
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== "succeeded")
        throw { error: "You still have to pay!" };
    } catch (err) {
      return err;
    }
    return paymentIntent;
  },

  sortCart: async (cart, country) => {
    let product_qty = [];
    let sanitizedCart = [];
    let supplierOrders = {};
    let unorderedProducts = [];
    let unavailableProducts = [];
    await Promise.all(
      cart.map(async (cartProduct) => {
        const product = await strapi.services.product.findOne({
          id: cartProduct.id,
        });
        if (!product || !product.created_by || !product.created_by.id) {
          unorderedProducts.push(product);
          return;
        }

        if (product.inventory < product.qty) {
          unavailableProducts.push(product);
          return;
        }

        var supplierId = product.created_by.id;
        var supplierEmail = product.created_by.email;

        var price = await strapi.config.functions.cart.getProductPrice(
          product,
          country
        );

        var productImage = "";
        if (product && product.media && product.media[0]) {
          var media = product.media[0];
          if (
            media.formats &&
            media.formats.thumbnail &&
            media.formats.thumbnail.url
          ) {
            productImage = media.formats.thumbnail.url;
          }
        }

        product_qty.push({
          id: product.id,
          name: product.name,
          qty: cartProduct.qty,
          price: price.toFixed(2),
          image: productImage,
        });
        sanitizedCart.push({ ...product, ...{ qty: cartProduct.qty } });

        // -------------------- SPLIT PURHCASE ORDERS BY SUPPLIER ID ----------------------
        if (supplierOrders.hasOwnProperty(supplierId)) {
          supplierOrders[supplierId].products.push({
            ...product,
            ...{ qty: cartProduct.qty },
          });
          supplierOrders[supplierId].product_qty.push({
            id: product.id,
            name: product.name,
            qty: cartProduct.qty,
            price: price.toFixed(2),
          });
        } else {
          supplierOrders[supplierId] = {
            supplierEmail: supplierEmail,
            products: [{ ...product, ...{ qty: cartProduct.qty } }],
            product_qty: [
              {
                id: product.id,
                name: product.name,
                qty: cartProduct.qty,
                price: price.toFixed(2),
              },
            ],
          };
        }
        return;
      }, country)
    );

    var error = await strapi.config.functions.cart.checkProductError(
      unorderedProducts,
      unavailableProducts
    );
    if (error) return error;

    return {
      product_qty,
      sanitizedCart,
      supplierOrders,
    };
  },

  createOrder: async (
    sanitizedCart,
    country,
    state,
    paymentIntent,
    currency,
    product_qty,
    userId,
    shipping_address,
    billing_address,
    customer_details,
    promoCode,
    utm,
    affiliate
  ) => {
    let order_subtotal_in_cents = strapi.config.functions.cart.subtotal(
      sanitizedCart,
      country,
      false
    );

    const shippingFeeIncluded =
      await strapi.config.functions.cart.shippingFeeIncluded(
        sanitizedCart,
        country
      );

    var shipping_fee = 0;
    if (shippingFeeIncluded) shipping_fee = 10.0;

    var discount = 0;
    var code = "";
    if (promoCode && promoCode.coupon) {
      var subtotal = order_subtotal_in_cents;
      if (shippingFeeIncluded) subtotal = subtotal + 1500;
      code = promoCode.code;
      const coupon = promoCode.coupon;
      if (coupon.amount_off) discount = coupon.amount_off / 100;
      if (coupon.percent_off)
        discount = Math.round(subtotal * (coupon.percent_off / 100));
    }

    let order_taxes_in_cents = await strapi.config.functions.cart.cartTaxes(
      sanitizedCart,
      country,
      state,
      shippingFeeIncluded
    );

    let order_total_in_cents = await strapi.config.functions.cart.checkout(
      sanitizedCart,
      country,
      state,
      false,
      promoCode
    );

    if (paymentIntent.amount !== order_total_in_cents) {
      const error =
        "The total to be paid is different from the total from the Payment Intent";
      return error;
    }

    var shipping_address =
      shipping_address.shipping_address_line1 +
      " " +
      shipping_address.shipping_address_line2 +
      ", " +
      shipping_address.shipping_city +
      ", " +
      shipping_address.shipping_state +
      ", " +
      shipping_address.shipping_country +
      ", " +
      shipping_address.shipping_zip;

    var billing_address =
      billing_address.billing_address_line1 +
      " " +
      billing_address.billing_address_line2 +
      ", " +
      billing_address.billing_city +
      ", " +
      billing_address.billing_state +
      ", " +
      billing_address.billing_country +
      ", " +
      billing_address.billing_zip;

    const orderEntity = await strapi.services.orders.create({
      payment_intent_id: paymentIntent.id,
      subtotal: (order_subtotal_in_cents / 100).toFixed(2),
      shipping_fee: shipping_fee.toFixed(2),
      discount: (discount / 100).toFixed(2),
      taxes: (order_taxes_in_cents / 100).toFixed(2),
      total: (order_total_in_cents / 100).toFixed(2),
      promo_code: code,
      currency,
      product_qty,
      products: sanitizedCart,
      user: userId,

      shipping_address: shipping_address,
      billing_address: billing_address,
      customer_details: customer_details,

      first_name: customer_details.first_name,
      last_name: customer_details.last_name,
      email: customer_details.email,
      phone_number: customer_details.phone_number,

      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      affiliate: affiliate,
    });
    const order = sanitizeEntity(orderEntity, {
      model: strapi.models.orders,
    });

    return order;
  },

  createPurchaseOrder: async (
    products,
    country,
    state,
    paymentIntent,
    currency,
    product_qty,
    userId,
    supplier_id,
    paymentInfo,
    shipping_address,
    billing_address,
    customer_details
  ) => {
    var subtotal_in_cents = strapi.config.functions.cart.subtotal(
      products,
      country,
      false
    );
    var taxes_in_cents = await strapi.config.functions.cart.cartTaxes(
      products,
      country,
      state
    );
    var total_in_cents = await strapi.config.functions.cart.checkout(
      products,
      country,
      state,
      true
    );

    var supplier_address = "";
    if (paymentInfo && paymentInfo.supplier_address)
      supplier_address = paymentInfo.supplier_address;

    var shipping_address =
      shipping_address.shipping_address_line1 +
      " " +
      shipping_address.shipping_address_line2 +
      ", " +
      shipping_address.shipping_city +
      ", " +
      shipping_address.shipping_state +
      ", " +
      shipping_address.shipping_country +
      ", " +
      shipping_address.shipping_zip;

    var billing_address =
      billing_address.billing_address_line1 +
      " " +
      billing_address.billing_address_line2 +
      ", " +
      billing_address.billing_city +
      ", " +
      billing_address.billing_state +
      ", " +
      billing_address.billing_country +
      ", " +
      billing_address.billing_zip;

    var entityPurchaseOrders = await strapi.services["purchase-orders"].create({
      product_qty,
      products,
      subtotal: (subtotal_in_cents / 100).toFixed(2),
      taxes: (taxes_in_cents / 100).toFixed(2),
      total: (total_in_cents / 100).toFixed(2),
      payment_intent_id: paymentIntent.id,
      user: userId,
      supplier_id,
      currency,

      shipping_address: shipping_address,
      billing_address: billing_address,
      customer_details: customer_details,

      first_name: customer_details.first_name,
      last_name: customer_details.last_name,
      email: customer_details.email,
      supplier: supplier_id,
      supplier_address: supplier_address,
    });
    var purchaseOrder = sanitizeEntity(entityPurchaseOrders, {
      model: strapi.models["purchase-orders"],
    });

    purchaseOrder.subtotal_in_cents = subtotal_in_cents;
    purchaseOrder.taxes_in_cents = taxes_in_cents;
    purchaseOrder.total_in_cents = total_in_cents;

    return purchaseOrder;
  },

  createInvoice: async (supplier_id, purchaseOrder, currency, paymentInfo) => {
    var taxRate = 0.14975; // Default tax rate - Quebec
    var fee_rate = 0.1; // Default supplier basic

    if (paymentInfo && paymentInfo.tax_rate) taxRate = paymentInfo.tax_rate;
    if (paymentInfo && paymentInfo.has_convenience) fee_rate = 0.3;

    var fee_subtotal_in_cents = purchaseOrder.subtotal_in_cents * fee_rate;
    var fee_taxes_in_cents = fee_subtotal_in_cents * taxRate;
    var fee_total_in_cents = fee_subtotal_in_cents + fee_taxes_in_cents;
    var invoice_total_in_cents =
      purchaseOrder.total_in_cents - fee_total_in_cents;

    var entityInvoice = await strapi.services["invoice"].create({
      supplier_id,
      date: new Date().toISOString().slice(0, 10),
      purchase_order: purchaseOrder.id,
      purchase_order_total: (purchaseOrder.total_in_cents / 100).toFixed(2),
      service_fee_subtotal: (fee_subtotal_in_cents / 100).toFixed(2),
      service_fee_taxes: (fee_taxes_in_cents / 100).toFixed(2),
      service_fee: (fee_total_in_cents / 100).toFixed(2),
      total: (invoice_total_in_cents / 100).toFixed(2),
      currency: currency,
      supplier: supplier_id,
    });
    var invoice = sanitizeEntity(entityInvoice, {
      model: strapi.models["invoice"],
    });
    invoice.invoice_total_in_cents = invoice_total_in_cents;

    return invoice;
  },

  createTransfer: async (
    invoice,
    purchaseOrder,
    product_qty,
    supplierStripeAcct,
    orderId,
    currency,
    supplierEmail,
    supplierId,
    chargeId,
    isStaging
  ) => {
    var amount = Math.round(invoice.invoice_total_in_cents);
    var paid = false;
    if (amount <= 0) return;
    try {
      var transfer = await stripe.transfers.create({
        amount: amount,
        currency: currency,
        destination: supplierStripeAcct,
        source_transaction: chargeId,
        metadata: {
          supplier_id: supplierId,
          supplierEmail: supplierEmail,
          purchase_order_id: purchaseOrder.id,
          po_subtotal: purchaseOrder.subtotal,
          po_taxes: purchaseOrder.taxes,
          po_total: purchaseOrder.total,
          service_fee_subtotal: invoice.service_fee_subtotal,
          service_fee_taxes: invoice.service_fee_taxes,
          service_fee: invoice.service_fee,
          total: invoice.total,
        },
      });
      if (transfer && transfer.id) {
        const updatedInvoice = await strapi.services.invoice.update(
          { id: invoice.id },
          { paid: true }
        );
      }
    } catch (err) {
      console.log(err);
      var error = "An error occured when creating transfering";
      strapi.config.functions.email.transferFailure(
        error,
        amount,
        purchaseOrder.id,
        supplierEmail,
        supplierId,
        err,
        isStaging
      );
      return;
    }

    return transfer;
  },

  createInfluencerTransfer: async (
    order,
    influencerUrl,
    stripe_acct_id,
    commission,
    currency,
    chargeId,
    isStaging
  ) => {
    if (!commission) commission = 0.1;
    var amount = Math.round(order.subtotal * commission);
    var commissionInCents = amount * 100;
    if (commissionInCents <= 0) return;
    try {
      var transfer = await stripe.transfers.create({
        amount: commissionInCents,
        currency: currency,
        destination: stripe_acct_id,
        source_transaction: chargeId,
        metadata: {
          influencer: influencerUrl,
          commission: commission,
          isStaging: isStaging,
        },
      });
    } catch (err) {
      console.log(err);
      var error = "An error occured when creating transfering";
      strapi.config.functions.email.transferFailure(
        error,
        amount,
        order.id,
        null,
        influencerUrl,
        err,
        isStaging
      );
      return;
    }

    return transfer;
  },
};
