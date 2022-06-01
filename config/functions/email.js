module.exports = {
  emailClientAbondonedCart: async (email, cart) => {
    var cart_rows = "";
    cart.forEach((product) => {
      cart_rows += `<tr>
          <td style="width: 30%"><img style="display: block; margin-left: auto; margin-right: auto; max-width: 100px;" src=${product.image} /></td>
          <td style="width: 70%"><div>${product.name}</div></td>
        </tr>`;
    });
    var cart_table = `<table><tbody>` + cart_rows + `</tbody></table>`;
    try {
      const send = await strapi.plugins.email.services.email.send({
        to: email,
        cc: "",
        from: "no-reply@waytoogood.com",
        bcc: "support@waytoogood.com",
        replyTo: "no-reply@waytoogood.com",
        template_id: "d-06c48b3e7a7c48939e31d9787200d52a",
        dynamic_template_data: {
          cart_table: cart_table,
        },
      });
      console.log("Sent client abondoned cart email to: " + email);
    } catch (error) {
      console.error(error);
    }
  },
  emailSupplierPurchaseOrder: async (
    product_qty,
    supplierEmail,
    shipping_address,
    customer_details,
    purchase_order_number,
    invoice_number,
    currency,
    isStaging
  ) => {
    var purchasedProductsString = "";
    product_qty.forEach((productqty) => {
      var qtyString = ", ";
      if (productqty.qty > 1)
        qtyString = " (x" + productqty.qty.toString() + "), ";
      purchasedProductsString += productqty.name + qtyString;
    });

    try {
      const send = await strapi.plugins.email.services.email.send({
        to: supplierEmail,
        cc: "",
        from: "no-reply@waytoogood.com",
        bcc: "support@waytoogood.com",
        replyTo: "no-reply@waytoogood.com",
        template_id: "d-63e526cd0bcb45e1984644a1b0c16a81",
        dynamic_template_data: {
          product_qty_string: purchasedProductsString,
          shipping_address_line1: shipping_address.shipping_address_line1,
          shipping_address_line2: shipping_address.shipping_address_line2,
          shipping_city: shipping_address.shipping_city,
          shipping_country: shipping_address.shipping_country,
          shipping_state: shipping_address.shipping_state,
          shipping_zip: shipping_address.shipping_zip,
          first_name: customer_details.first_name,
          last_name: customer_details.last_name,
          email: customer_details.email,
          purchase_order_number: purchase_order_number,
          invoice_number: invoice_number,
          currency: currency,
          isStaging: isStaging,
        },
      });
      console.log("Sent purchase order to: " + supplierEmail);
    } catch (error) {
      console.error(error);
    }
  },
  emailClientOrderDetails: async (
    product_qty,
    shipping_address,
    customer_details,
    order_number,
    subtotal,
    taxes,
    shipping_fee,
    total,
    currency,
    isStaging,
    name,
    shippingAddress
  ) => {
    var cart_rows = "";
    product_qty.forEach((productqty) => {
      var qtyString = "";
      var productString = "";
      if (productqty.qty > 1)
        qtyString = " (x" + productqty.qty.toString() + ")";
      productString += productqty.name + qtyString;

      cart_rows += `<tr>
          <td style="width: 30%"><img style="display: block; margin-left: auto; margin-right: auto; max-width: 100px;" src=${productqty.image} /></td>
          <td style="width: 70%"><div>${productString}</div></td>
        </tr>`;
    });
    var cart_table = `<table><tbody>` + cart_rows + `</tbody></table>`;

    try {
      const send = await strapi.plugins.email.services.email.send({
        to: customer_details.email,
        cc: "",
        from: "no-reply@waytoogood.com",
        bcc: "support@waytoogood.com",
        replyTo: "no-reply@waytoogood.com",
        template_id: "d-715cdfabaa20405e98975f2320ffb823",
        dynamic_template_data: {
          product_qty_string: cart_table,
          shipping_address: shippingAddress,
          first_name: name,
          last_name: customer_details.last_name,
          email: customer_details.email,
          order_number: order_number,
          subtotal: subtotal,
          taxes: taxes,
          shipping_fee: shipping_fee,
          total: total,
          currency: currency,
          isStaging: isStaging,
        },
      });
      console.log("Sent client order to: " + customer_details.email);
    } catch (error) {
      console.error(error);
    }
  },
  transferFailure: async (
    error,
    amount,
    purchase_order_id,
    supplier_email,
    supplier_id,
    err,
    isStaging
  ) => {
    var errorString = err.toString();
    try {
      const send = await strapi.plugins.email.services.email.send({
        to: "support@waytoogood.com",
        from: "",
        template_id: "d-923d28b905d941e3b9177082bfa8bbc3",
        dynamic_template_data: {
          error: error,
          amount: amount,
          purchase_order_id: purchase_order_id,
          supplier_email: supplier_email,
          supplier_id: supplier_id,
          errorString: errorString,
          isStaging: isStaging,
        },
      });
      console.log("Sent transfer failure to: " + "support@waytoogood.com");
    } catch (error) {
      console.error(error);
    }
  },
  emailNotifyCustomer: async (orderId, email, tracking_number) => {
    var parcelAppUrl = "https://parcelsapp.com/en/tracking/" + tracking_number;
    try {
      const send = await strapi.plugins.email.services.email.send({
        to: email,
        from: "no-reply@waytoogood.com",
        template_id: "d-0ddf479e608a49749dd8cd21660bf7db",
        dynamic_template_data: {
          orderId: orderId,
          tracking_number: tracking_number,
          parcelAppUrl: parcelAppUrl,
        },
      });
      console.log("Sent notify email to: " + email);
    } catch (error) {
      console.error(error);
    }
  },
};
