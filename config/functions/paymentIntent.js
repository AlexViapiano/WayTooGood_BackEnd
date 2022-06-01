var SalesTax = require("sales-tax");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const { sanitizeEntity } = require("strapi-utils");

module.exports = {
  sortCart: async (cart, country) => {
    let sanitizedCart = [];
    let product_qty = [];
    let unavailableProducts = [];
    await Promise.all(
      cart.map(async (product) => {
        const validatedProduct = await strapi.services.product.findOne({
          id: product.id,
        });

        if (!validatedProduct)
          var error = "There was a problem with a product in your cart.";
        if (country == "US" && validatedProduct.country_US != true) return;
        if (country == "CA" && validatedProduct.country_CA != true) return;
        if (validatedProduct) {
          if (validatedProduct.inventory < product.qty) {
            unavailableProducts.push(validatedProduct);
            return;
          }
          validatedProduct.qty = product.qty;
          sanitizedCart.push(validatedProduct);
          product_qty.push({
            id: product.id,
            qty: product.qty,
          });
        }
      })
    );
    var error = await strapi.config.functions.cart.checkProductError(
      [],
      unavailableProducts
    );
    if (error) return error;
    return {
      sanitizedCart,
      product_qty,
    };
  },
};
