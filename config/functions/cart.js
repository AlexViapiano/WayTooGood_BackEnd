var SalesTax = require("sales-tax");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  getCurrency: async (country) => {
    const currency = country == "CA" ? "CAD" : country == "US" ? "USD" : null;
    return currency;
  },

  getProductPrice: async (product, country) => {
    var price =
      country == "US" && product.country_US
        ? product.price_USD
        : country == "CA" && product.country_CA
        ? product.price_CAD
        : null;
    return price;
  },

  checkProductError: async (unorderedProducts, unavailableProducts) => {
    if (unorderedProducts.length > 0) {
      const productErrors = unorderedProducts.map(
        (unorderedProduct) => unorderedProduct.name
      );
      return {
        error:
          "There was a problem regarding an invalid product: " +
          productErrors.toString(),
      };
    }

    if (unavailableProducts.length > 0) {
      const productErrors = unavailableProducts.map(
        (unavailableProducts) => unavailableProducts.name
      );
      return {
        error:
          "These are products are no longer in stock: " +
          productErrors.toString(),
      };
    }
    return null;
  },

  subtotal: (cart, country, filterTaxExempt) => {
    return cart
      .map((product) => {
        if (filterTaxExempt && product.tax_exempt) return 0;
        var price =
          country == "US" && product.country_US
            ? product.price_USD
            : country == "CA" && product.country_CA
            ? product.price_CAD
            : null;
        var price_in_cents = price.toFixed(0) * 100;
        return price_in_cents * product.qty;
      })
      .reduce((sum, i) => sum + i, 0);
  },

  shippingFeeIncluded: (cart, country) => {
    var direct_subtotal = cart
      .map((product) => {
        if (!product.direct_shipping && !product.frozen) {
          var price =
            country == "US" && product.country_US
              ? product.price_USD
              : country == "CA" && product.country_CA
              ? product.price_CAD
              : null;
          return price * product.qty;
        } else return 0;
      })
      .reduce((sum, i) => sum + i, 0);
    if (direct_subtotal > 0 && direct_subtotal < 50) return true;
    else return false;
  },

  cartTaxes: async (cart, country, state, shippingFeeIncluded) => {
    var taxes = 0;
    if (country == "CA") {
      var subtotalTaxExempt = strapi.config.functions.cart.subtotal(
        cart,
        country,
        true
      );
      if (shippingFeeIncluded) subtotalTaxExempt = subtotalTaxExempt + 1500;
      taxes = await SalesTax.getSalesTax("CA", state).then(
        (provinceSalesTax) => provinceSalesTax.rate * subtotalTaxExempt
      );
    }
    return taxes;
  },

  checkout: async (
    cart,
    country,
    state,
    skipShippingFee,
    promoCode,
    skipTaxes
  ) => {
    // 1 - Calculate initial values
    var invoiceTotal = await strapi.config.functions.cart.subtotal(
      cart,
      country,
      false
    );

    var invoiceSubtotalForTaxes = await strapi.config.functions.cart.subtotal(
      cart,
      country,
      true
    );

    // 2 - Add shipping fee of 10$
    var shippingFeeIncluded = false;
    if (!skipShippingFee) {
      shippingFeeIncluded =
        await strapi.config.functions.cart.shippingFeeIncluded(cart, country);
    }
    if (shippingFeeIncluded) {
      invoiceTotal = invoiceTotal + 1500;
      invoiceSubtotalForTaxes = invoiceSubtotalForTaxes + 1500;
    }

    // 3 - Deduct discount from promo code
    if (promoCode && promoCode.coupon) {
      const coupon = promoCode.coupon;
      var discount = 0;
      if (coupon.amount_off) discount = coupon.amount_off;
      if (coupon.percent_off)
        discount = invoiceTotal * (coupon.percent_off / 100);
      invoiceTotal = invoiceTotal - Math.round(discount);
    }

    // 4 - Add sales taxes
    var invoiceTaxes = 0;
    if (country == "CA" && !skipTaxes) {
      invoiceTaxes = await SalesTax.getSalesTax("CA", state).then(
        (provinceSalesTax) => {
          const taxes = (
            provinceSalesTax.rate * invoiceSubtotalForTaxes
          ).toFixed(0);
          return parseInt(taxes, 10);
        }
      );
      invoiceTotal = invoiceTotal + invoiceTaxes;
    }

    if (skipTaxes) {
      return {
        invoiceTotal: invoiceTotal,
        invoiceSubtotalForTaxes: invoiceSubtotalForTaxes,
      };
    }

    return invoiceTotal;
  },
};
